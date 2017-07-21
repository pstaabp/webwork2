###
#
#  This is a Moo object version of a Library Problem.
#
###


package Models::Library::Problem;
use feature 'say';
use Moo;
use Types::Standard qw(ArrayRef InstanceOf Str Int);

use Digest::SHA1  qw/sha1_hex/;
use Hash::MoreUtils qw/slice_def_map slice_def/;
use Path::Class;
use Data::Dump qw/dump dd/;

use Models::Library::DBsubject;
use Models::Library::ProblemAuthor;


has file_path => (is => 'ro', isa => Str, required=>1);
has id => (is=>'ro', isa => Int, required => 1);
has problem_author => (is=>'ro',isa => InstanceOf['Models::Library::ProblemAuthor']);
has textbookProblems => (is=>'ro',isa => ArrayRef[InstanceOf['Models::Library::TextbookProblem']] );
has DBinfo => (is => 'ro', isa => InstanceOf['Models::Library::DBinfo']);
has date => (is=>'ro',default=>"");
has mlt => (is=>'ro',default=>"");
has mlt_leader => (is=>'ro',default=>"");
has keywords => (is=>'ro',default=>"");
has level => (is=>'ro',default=>"");
has MO => (is=>'ro',default=>"");
has language => (is=>'ro');
has static => (is=>'ro');
has statement => (is=> 'ro',default=>"");
has solution => (is=> 'ro',default=>"");
has isLink => (is=>'ro',default =>"");

## this returns the number of documents in the database.

sub count {
    my $self = shift;

    return "not yet implemented.";
}

## this returns a unique list of elements in the database

sub unique_results {
    my ($self,$info) = @_;
    return "not yet implemented.";
}

sub find {
    my ($self,$searchQuery) = @_;
    warn dump $searchQuery;
    my %searchfields = (DBsubject=>'subj.name',
                        DBchapter=>'ch.name',
                        DBsection=>'me.name',
                        lastname=>'author.lastname',
                        firstname=>'author.firstname',
                        institution=>'author.institution',
                        level=>'pg.level',
                        keyword=>'kw.keyword');
    my %searchhash = slice_def_map($searchQuery,%searchfields);
    warn dump %searchhash;

    DBIx::Mint->connect('dbi:mysql:dbname=webwork', 'webworkWrite', 'password', {
        AutoCommit     => 1,
        RaiseError     => 1,
    });

    say "in find()";
    my $rs = DBIx::Mint::ResultSet->new(table => 'OPL_DBsection')
        ->inner_join(['OPL_DBchapter', 'ch'], { 'me.DBchapter_id' => 'ch.DBchapter_id' })
        ->inner_join(['OPL_DBsubject', 'subj'], {'ch.DBsubject_id' => 'subj.DBsubject_id'})
        ->inner_join(['OPL_pgfile','pg'],{'me.DBsection_id' => 'pg.DBsection_id'})
        ->inner_join(['OPL_pgfile_keyword','pgkw'],{'pg.pgfile_id' => 'pgkw.pgfile_id'})
        ->inner_join(['OPL_keyword','kw'],{'kw.keyword_id' => 'pgkw.keyword_id'})
        ->inner_join(['OPL_author','author'],{'pg.author_id' => 'author.author_id'})
        ->inner_join(['OPL_path','path'],{'pg.path_id'=>'path.path_id'});

    $rs->set_target_class( 'Model::Library::Problem');
    $rs = $rs->select('pg.pgfile_id|id','subj.name|DBsubject','ch.name|DBchapter','me.name|DBsection','pg.author_id',
                            'pg.level','path.path','pg.filename')->search(\%searchhash);

    my @problems = $rs->all;

    @problems = map {
      my $params = $_;
      $params->{file_path} = $params->{path}."/".$params->{filename};
      $self->new($params);
    } @problems;

    #warn dump \@problems;

    return \@problems;
}

## this method inserts the LibraryProblem to the database

sub insert {
    my $self = shift;

    my $DBsection_id = $self->DBinfo->insert;
    my $author_id = $self->problem_author->insertAuthor;

    my $path_info = {};
    my $path_obj = file($self->path);
    $path_info->{path} = $path_obj->parent->stringify if $self->path; # get the directory of the pgfile.

    my $path = Models::Library::Path->find($path_info);
    my $path_id = $path->{path_id} || Models::Library::Path->insert($path_info);

    my $pgfile_info = {};
    $pgfile_info->{DBsection_id} = $DBsection_id if $DBsection_id;
    $pgfile_info->{author_id} = $author_id if $author_id;
    $pgfile_info->{institution} = $self->problem_author->institution if $self->problem_author->institution;
    $pgfile_info->{path_id} = $path_id if $path_id;
    $pgfile_info->{filename} = $path_obj->basename;
    $pgfile_info->{level} = $self->level if $self->level;
    $pgfile_info->{language} = $self->language if $self->language;
    $pgfile_info->{static} = $self->static if $self->static;
    $pgfile_info->{MO} = $self->MO if $self->MO;

    my $pgfile = Models::Library::PGFile->find($pgfile_info);
    my $pgfile_id = $pgfile->{pgfile_id} || Models::Library::PGFile->insert($pgfile_info);

    my $mlt_info = {};
    $mlt_info->{name} = $self->mlt if $self->mlt;
    $mlt_info->{DBsection_id} = $DBsection_id;
    $mlt_info->{leader} = $pgfile_id if $self->mlt_leader;
    if($mlt_info->{name} && $mlt_info->{leader}) {
        my $mlt = Models::Library::MoreLT->find($mlt_info);
        my $mlt_id = $mlt->{moreld_id} || Models::Library::MoreLT->insert($mlt_info);
    }

    for my $textbook (@{$self->textbookProblems}){
        $textbook->insert($pgfile_id);
    }


    for my $keyword (@{$self->keywords}){
        $keyword =~ s/([[:upper:]])/defined $1 ? lc $1 : $1/eg;  # make everything lowercase
        $keyword =~ s/\s//g;  # remove spaces
        my $kw = Models::Library::Keyword->find({keyword=>$keyword});
        my $keyword_id = $kw->{keyword_id} || Models::Library::Keyword->insert({keyword=>$keyword});
        # database table between pgfiles and keywords
        my $pgkw = Models::Library::PGFileKeyword->find({keyword_id => $keyword_id,pgfile_id=> $pgfile_id});

        Models::Library::PGFileKeyword->insert({keyword_id => $keyword_id,pgfile_id=> $pgfile_id}) unless $pgkw;
    }

}


## this method updates the LibraryProblem to the database

sub update {

}

## this is the toString method, useful for printing out

sub toString {
  my $self = shift;
  my $str = "{ \n\t path=>" . $self->path . ", \n"
    . "\t id=> " . $self->id . ", \n";
  $str .= ($self->institution) ?  "\t institution=> " . $self->institution . ", \n" : "";
  $str .= $self->author_last_name ?  "\t author_last_name=> " . $self->author_last_name . ", \n" : "";
  $str .= $self->author_first_name ?  "\t author_first_name=> " . $self->author_first_name . ", \n" : "";
  $str .= $self->author_email ?  "\t author_email=> " . $self->author_email . ", \n" : "";
  $str .= $self->DBsubject ?  "\t DBsubject=> " . $self->DBsubject . ", \n" : "";
  $str .= $self->DBchapter ? "\t DBchapter=> " . $self->DBchapter . ", \n" : "";
  $str .= $self->DBsection ?  "\t DBsection=> " . $self->DBsection . ", \n" : "";
  $str .= $self->date ?  "\t date=> " . $self->date . ", \n" : "";
  $str .= $self->mlt ?  "\t mlt=> " . $self->mlt . ", \n" : "";
  $str .= $self->mlt_leader ? "\t mlt_leader=> " . $self->mlt_leader . ", \n" : "";
  $str .= $self->keywords ?  "\t keywords=> " . $self->keywords . ", \n" : "";
  $str .= $self->level  ? "\t level=> " . $self->level . ", \n" : "";
  $str .= $self->mo  ?  "\t mo=> " . $self->mo . ", \n" : "";
  if($self->textbookProblems){
    $str .= "\t[";
    for my $text (@{$self->textbookProblems}){
      $str .= $text->toString();
    }
    $str .= "\t],\n";
  }
  $str .= $self->statement ? "\t statement=> " . $self->statement : "";
  $str .= "}\n";
  return $str;
}




1;

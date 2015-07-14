package Models::Library::Problem;
use feature 'say';
use Moo;
use MooX::Types::MooseLike::Base qw(ArrayRef InstanceOf);
#with 'DBIx::Mint::Table';
use Models::Library::Constant qw/$DATABASE/;

use namespace::clean;
use Digest::SHA1  qw/sha1_hex/;
use Hash::MoreUtils qw/slice_def_map slice_def/;
use Path::Class;
use Data::Dump qw/dd/;

use Models::Library::DBsubject;
use Models::Library::ProblemAuthor;


#my @problem_author_fields = qw/institution lastname firstname email/;

has path => (is => 'rw', required=>1);
has id => (is=>'ro');
has problem_author => (is=>'rw',isa => InstanceOf['Models::Library::ProblemAuthor']);
has textbookProblems => (is=>'rw',isa => ArrayRef[InstanceOf['Models::Library::TextbookProblem']] );
has DBinfo => (is => 'rw', isa => InstanceOf['Models::Library::DBinfo']);

has date => (is=>'rw',default=>"");
has mlt => (is=>'rw',default=>"");
has mlt_leader => (is=>'rw',default=>"");
has keywords => (is=>'rw',default=>"");
has level => (is=>'rw',default=>"");
has MO => (is=>'rw',default=>"");
has language => (is=>'rw');
has static => (is=>'rw');
has statement => (is=> 'rw',default=>"");
has isLink => (is=>'rw',default =>"");


## this method inserts the LibraryProblem to the database

sub insertMYSQL {
    my $self = shift;
  
    my $DBsection_id = $self->DBinfo->insert;
    my $author_id = $self->problem_author->insertAuthor; 
  
    
  
    my $path_info = {};
    my $path_obj = file($self->path);
    $path_info->{path} = $path_obj->parent->stringify if $self->path; # get the directory of the pgfile. 
    #$path_info->{machine} = $self->machine if $self->machine;
    #$path_info->{user} = $self->user if $self->user;

    #dd $path_info;
    #dd length($path_info->{path});


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

sub insert {
    my $self = shift;
    if($DATABASE->{type} eq 'MYSQL'){
        $self->insertMYSQL();
    } elsif($DATABASE->{type} eq 'MONGO'){
        $self->insertMONGO();
    
    }


}

sub insertMONGO {
    my $self = shift;
    my $db = $DATABASE->{MONGOclient}->get_database($DATABASE->{dbname});
    my $problems = $db->get_collection('problems');
    my $textbookProblems = $db->get_collection('textbook_problems');
    my @tbProbs = ();
    for my $tbprob (@{$self->textbookProblems}){
        my $tbprob_info = { title=>$tbprob->title,
                        author=>$tbprob->author,
                        edition=>$tbprob->edition,
                        publisher=>$tbprob->publisher,
                        isbn =>$tbprob->isbn,
                        pubdate =>$tbprob->pubdate,
                        chapter =>$tbprob->chapter,
                        chapter_number => $tbprob->chapter_number,
                        section =>$tbprob->section,
                        section_number => $tbprob->section_number,
                        problem => $tbprob->problem,
                        page =>$tbprob->page};
        #dd $tbprob_info;
        my $tb = $textbookProblems->find_one($tbprob_info);
        #dd $tb;
        if(defined($tb)){
            #print "in if \n";
            #dd $tb->{_id}->value;
            push(@tbProbs,$tb->{_id}->value);
        } else {
            #print "here: ";
            #dd $tbprob_info;
            my $tb_id = $textbookProblems->insert($tbprob_info);
            #dd $tb_id;
            push(@tbProbs,$tb_id->value);
        }
    }
    #dd @tbProbs;
    my $prob = {path => $self->path, 
                DBsubject => $self->DBinfo->DBsubject,
                DBchapter => $self->DBinfo->DBchapter,
                DBsection => $self->DBinfo->DBsection,
                last_name => $self->problem_author->lastname,
                first_name => $self->problem_author->firstname,
                email => $self->problem_author->email,
                institution => $self->problem_author->institution,
                date => $self->date,
                mlt => $self->mlt,
                mlt_leader => $self->mlt_leader,
                keywords => $self->keywords,
                level => $self->level,
                MO => $self->MO,
                language => $self->language,
                static => $self->static,
                statement => $self->statement,
                tb_problems => \@tbProbs
                };
    
    $problems->insert($prob);
       
}

## this is the general find method which searches in the correct part of the Libary problem

sub find {
    my $self = shift;
    if($DATABASE->{type} eq 'MYSQL'){
        $self->findMYSQL(@_);
    } elsif($DATABASE->{type} eq 'MONGO'){
        $self->findMONGO(@_);
    
    }
}

sub findMYSQL {
    my ($self,$searchQuery) = @_;
    my %searchfields = (DBsubject=>'subj.name',
                        DBchapter=>'ch.name',
                        DBsection=>'me.name',
                        lastname=>'author.lastname',
                        firstname=>'author.firstname',
                        institution=>'author.institution',
                        level=>'pg.level',
                        keyword=>'kw.keyword');
    my %searchhash = slice_def_map($searchQuery,%searchfields);
    dd %searchhash;
   
    say "in find()";
    my $dbrs = DBIx::Mint::ResultSet->new(table => 'OPL_DBsection')
        ->inner_join(['OPL_DBchapter',   'ch'], { 'me.DBchapter_id' => 'ch.DBchapter_id' })
        ->inner_join(['OPL_DBsubject', 'subj'], {'ch.DBsubject_id' => 'subj.DBsubject_id'})
        ->inner_join(['OPL_pgfile','pg'],{'me.DBsection_id' => 'pg.DBsection_id'})
        ->inner_join(['OPL_pgfile_keyword','pgkw'],{'pg.pgfile_id' => 'pgkw.pgfile_id'})
        ->inner_join(['OPL_keyword','kw'],{'kw.keyword_id' => 'pgkw.keyword_id'})
        ->inner_join(['OPL_author','author'],{'pg.author_id' => 'author.author_id'});
  
    $dbrs = $dbrs->select('pg.pgfile_id','subj.name|DBsubject','ch.name|DBchapter','me.name|DBsection','pg.author_id',
                            'pg.level');
    
    say "here";
    $dbrs = $dbrs->search(\%searchhash);
    say "and here";
    my @all_records = $dbrs->all;
    say "now here";
    dd @all_records;
}

sub findMONGO {
    my ($self,$searchQuery) = @_;
    
    # replace keyword with keywords in the hash.
    $searchQuery->{keywords} = $searchQuery->{keyword};
    $searchQuery->{keyword} = undef; 
    my %query =  slice_def $searchQuery;  # throw away any undefined
    
    my $db = $DATABASE->{MONGOclient}->get_database($DATABASE->{dbname});
    my $problems = $db->get_collection('problems');
    my $textbookProblems = $db->get_collection('textbook_problems');

    my $cursor = $problems->find(\%query);
    return $cursor->all;
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


package Models::Library::PGFile;
use Moo;
use Types::Standard qw(Int Str);

use Data::Dump qw/dd/;

use Models::Library::Textbook; 

#with 'DBIx::Mint::Table';
has DBsection_id => (is=>'rw',isa => Int);
has author_id => (is=>'rw',isa => Int);
has path_id => (is=>'rw',isa => Int);
has institution => (is=>'rw',isa => Str);
has filename => (is=>'rw',isa => Str);
has level => (is=>'rw',isa => Int);
has static => (is=>'rw',isa => Str);
has MO => (is=>'rw',isa => Str);



sub insertDB {
    my $self = shift;

    my $info = {};
    $info->{DBsection_id} = $self->DBsection_id if $self->DBsection_id;
    $info->{author_id} = $self->author_id if $self->author_id;
    $info->{path_id} = $self->path_id if $self->path_id;
    $info->{institution} = $self->institution if $self->institution;
    $info->{filename} = $self->filename if $self->filename;
    $info->{level} = $self->level if $self->level;
    $info->{static} = $self->static if $self->static;
    $info->{MO} = $self->MO if $self->MO;

    my $pgfile = Models::Library::Textbook->find($info);

    # add it to the database unless it already exists.
    return $pgfile->{pgfile_id} ||  Models::Library::Textbook->insert($info);

}

sub find {
  my ($self,$searchQuery) = @_;
  warn dump $searchQuery;
  warn "in find()";
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

  my $rs = DBIx::Mint::ResultSet->new(table => 'OPL_DBsection')
      ->inner_join(['OPL_DBchapter', 'ch'], { 'me.DBchapter_id' => 'ch.DBchapter_id' })
      ->inner_join(['OPL_DBsubject', 'subj'], {'ch.DBsubject_id' => 'subj.DBsubject_id'})
      ->inner_join(['OPL_pgfile','pg'],{'me.DBsection_id' => 'pg.DBsection_id'})
      ->inner_join(['OPL_pgfile_keyword','pgkw'],{'pg.pgfile_id' => 'pgkw.pgfile_id'})
      ->inner_join(['OPL_keyword','kw'],{'kw.keyword_id' => 'pgkw.keyword_id'})
      ->inner_join(['OPL_author','author'],{'pg.author_id' => 'author.author_id'});

  $rs->set_target_class( 'Model::Library::Problem');
  $rs = $rs->select('pg.pgfile_id','subj.name|DBsubject','ch.name|DBchapter','me.name|DBsection','pg.author_id',
                          'pg.level')->search(\%searchhash);

  my @problems = $rs->all;
  warn dump \@problems;
  @problems = map { new($_) } @problems;




  return \@problems;




  return [];

}


1;

package Dancer2::Session::WeBWorK;


use Moo;
use Dancer2::Core::Types;
use Data::Dump qw/dump/;

use DBI;  ## can't see to use the Dancer2 plugin here.
with "Dancer2::Core::Role::SessionFactory";

has course_id => (
    is      => 'ro',
    isa     => Str,
    default => sub { '' },
);

has db_name => (
  is      => 'ro',
  isa     => Str,
  default => sub { 'webwork' },
);

has host_name => (
  is      => 'ro',
  isa     => Str,
  default => sub { '127.0.0.1' },
);

has port => (
  is    => 'ro',
  isa   => Int,
  default => sub { 3306}
);

has password => (
  is    => 'ro',
  isa   => Str,
  default => sub {''},
  required => 1
);

has username => (
  is    => 'ro',
  isa   => Str,
  default => sub {''},
  required => 1
);


my $dbh;

sub BUILD {
    my $self = shift;
    my $dsn = "DBI:mysql:database=".$self->db_name.";host=".$self->host_name .";port=".$self->port.";";
    $dbh = DBI->connect($dsn, $self->username, $self->password);
    my $sth = $dbh->prepare('show tables');
    # #$sth->execute($self->course_name. '_key');
    $sth->execute();
    if ($sth->rows == 0) {
      die "The database ". $self->db_name . " is not found";
    }
}


#--------------------------------------------------------------------------#
# Role composition
#--------------------------------------------------------------------------#

with 'Dancer2::Core::Role::SessionFactory';

# When saving/retrieving, we need to add/strip the _id parameter
# because the Dancer2::Core::Session object keeps them as separate
# attributes

sub _retrieve {
    my ( $self, $id ) = @_;
    my $result = $dbh->do("select * from test_key where key_not_a_keyword='?'",$id);
    warn "in _retrieve";
    warn $result;

    # my $doc = $self->_collection->find_one( { _id => $id } );
    # return $doc->{data};
}

sub _flush {
    my ( $self, $id, $data ) = @_;
    warn dump $dbh;
    warn dump $id;
    warn dump $self->course_id; 
    my $result = $dbh->do("select * from test_key where key_not_a_keyword='?'",undef,$id);
    warn "in _flush";
    warn dump $data;
    warn dump $result;
    # $self->_collection->save( { _id => $id, data => $data }, { safe => 1 } );
}

sub _destroy {
    my ( $self, $id ) = @_;
    # $self->_collection->remove( { _id => $id }, { safe => 1 } );
}

sub _sessions {
    my ($self) = @_;
    # my $cursor = $self->_collection->query->fields( { _id => 1 } );
    # return [ map { $_->{_id} } $cursor->all ];
}

sub _change_id {
    my ( $self, $old_id, $new_id ) = @_;
    $self->_flush( $new_id, $self->_retrieve( $old_id ) );
    $self->_destroy( $old_id );
}

1;

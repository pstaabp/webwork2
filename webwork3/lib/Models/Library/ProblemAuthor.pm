package Models::Library::ProblemAuthor;
use Moo;
use Types::Standard qw(Str);

use Models::Library::Schema;

use Data::Dump qw/dd/;

with 'DBIx::Mint::Table';
has author_id => (is=>'rw');
has institution => (is=>'rw',isa => Str, default => "");
has lastname => (is=>'rw',isa => Str, default => "");
has firstname => (is=>'rw',isa => Str, default => "");
has email => (is=>'rw',isa => Str, default => "");

my %authfields = (lastname=>'author.lastname',firstname=>'author.firstname',institution=>'author.institution');

sub insertAuthor {
    my $self = shift;

    my $info = {};
    $info->{email} = $self->email if defined($self->email);
    $info->{firstname} = $self->firstname if defined($self->firstname);
    $info->{lastname} = $self->lastname if defined($self->lastname);
    $info->{institution} = $self->institution if defined($self->institution);
    my $author = Models::Library::ProblemAuthor->find($info);
    return $author->{author_id} || Models::Library::ProblemAuthor->insert($info);
}

1;

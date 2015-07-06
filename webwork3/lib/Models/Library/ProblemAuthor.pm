package Models::Library::ProblemAuthor;
use Moo;
use MooX::Types::MooseLike::Base qw(Str);

use namespace::clean;
use Data::Dump qw/dd/;

with 'DBIx::Mint::Table';
has author_id => (is=>'rw');
has institution => (is=>'rw',isa => Str);
has lastname => (is=>'rw',isa => Str);
has firstname => (is=>'rw',isa => Str);
has email => (is=>'rw',isa => Str);

my %authfields = (lastname=>'author.lastname',firstname=>'author.firstname',institution=>'author.institution');

sub insertAuthor {
    my $self = shift;

    my $info = {};
    $info->{email} = $self->email if defined($self->email);
    $info->{firstname} = $self->firstname if defined($self->firstname);
    $info->{lastname} = $self->lastname if defined($self->lastname);
    $info->{institution} = $self->institution if defined($self->institution);
    my $author = Library::ProblemAuthor->find($info);
    return $author->{author_id} || Library::ProblemAuthor->insert($info);
}

1;
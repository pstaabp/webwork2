package Models::Course;

use Moo;
use MooX::Types::MooseLike::Base qw(Str Int Bool HashRef ArrayRef);
use namespace::clean;
use base qw(Exporter);
our @EXPORT_OK = qw(Course);


use DateTime;
use Models::User;

## fields

has 'id' => (
	is => 'ro',
	isa => Str # set up originally as a hash of name or maybe an index.  
);

has 'name' => (
	is => 'rw',
	isa => Str
);

has 'start_date'  => (
	is => 'rw',
	isa => Int # maybe use DateTime
);

has 'end_date' => (
	is => 'rw',
	isa => Int
); 

has 'status' => (  # What is this for? 
	is => 'rw',
	isa => Int #maybe use DateTime
);

has 'description' => (
	is => 'rw',
	isa => Str
);

has 'state' => (
	is => 'rw',
	isa => Bool
);

has 'tags' => (  # tags are stored as a has of key/value pairs
	is => 'rw',
	isa => HashRef
);

# maybe make these two private and only accessible via getters/setters

has 'users' => (
	is => 'rw',
	isa => ArrayRef['User']
);

# has 'teams' => {
# 	is => 'rw',
# 	isa => ArrayRef['Team']
# };

sub addUser {
	my ($self,$user) = @_;
	push(@{$self->{users}},$user);
}


1;
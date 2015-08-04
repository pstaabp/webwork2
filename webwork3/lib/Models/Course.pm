package Models::Course;

use DateTime;
use Models::User;

use Types::Standard qw/Str Int HashRef ArrayRef Bool InstanceOf/;

use Moo;
use namespace::clean;



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
	isa => ArrayRef[InstanceOf['Models::User']]
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
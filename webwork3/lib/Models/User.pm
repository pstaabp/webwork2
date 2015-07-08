package Models::User;

use Types::Standard qw/Str Int HashRef ArrayRef Bool InstanceOf/;

use Models::Course;
use Moo;
use namespace::clean;





has 'username' => (
	is => 'rw',
	isa => Str  # Maybe make a type that only accepts standard login strings
);

has 'tags' => (
	is => 'rw',
	isa => HashRef
);

has 'contact_info' => (
	is => 'rw',
	isa => Str  # this probably needs to be more general (Hash Ref or own type)
);

has 'password' => (
	is => 'rw',
	isa => Str
);

has 'achievement_info' => (  # should this be in here or how can we add this in later for an Achievement module.
	is => 'rw',
	isa => Str  # this probably needs to be more general (Hash Ref or own type)
);

has 'courses' => (
	is => 'rw',
	isa => ArrayRef[InstanceOf['Course']]
);

# sub addCourse {
# 	my ($self,$course) = @_;
# 	push(@{$self->{courses}},$course);  # need to check that the course hasn't already been added. 
# }

1;
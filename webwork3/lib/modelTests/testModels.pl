use Models::Course;
use Models::Users::Student;

my $student = Models::Users::Student->new({username=>"user1"});

my $course = Models::Course->new(
	name=>'maa101');

$course->addUser($student);

print $course->{name} . "\n";
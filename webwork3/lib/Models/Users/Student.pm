package Models::Users::Student;

use Models::User;

use Moo;
use namespace::clean;



extends 'Models::User';

sub joinTeam {
	my ($self, $course, $teamID);

	# missing code to be filled in
}

sub getTeams {
	my $self = shift; 
	my $teams = ();
	for my $course ($self->{courses}) {
		my $team = $course->getTeams($self);
		if ($team) {
			push(@{$teams},$team);
		}
	}
}

1;
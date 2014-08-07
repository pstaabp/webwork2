### Library routes
##
#  These are the routes for all library functions in the RESTful webservice
#
##

package Routes::Authentication;

use strict;
use warnings;
use Dancer ':syntax';
use Dancer::Plugin::Database;
use WeBWorK::Constants;
use Data::Dumper;

use base qw(Exporter);
our @EXPORT    = ();
our @EXPORT_OK = qw(checkPermissions setCourseEnvironment buildSession setCookie createSession isSessionCurrent);
our $PERMISSION_ERROR = "You don't have the necessary permissions.";

## the following routes is matched for any URL starting with /courses. It is used to load the 
#  CourseEnvironment
#
#  Note: for this to match before others, make sure this package is loaded before others.
#

any ['get','put','post','delete'] => '/courses/*/**' => sub {

	my ($courseID) = splat;
	setCourseEnvironment($courseID);
	pass;
};

any ['get','post'] => '/renderer/courses/*/**' => sub {
	my ($courseID) = splat;
	setCourseEnvironment($courseID);
	pass;
};

sub setCourseEnvironment {

	my $courseID = shift;

	if (defined($courseID)) {
		session course => $courseID;
	} else {
		send_error("The course has not been defined.  You may need to authenticate again",401);	
	}

	var ce => WeBWorK::CourseEnvironment->new({webwork_dir => config->{webwork_dir}, courseName=> session->{course}});

	var db => new WeBWorK::DB(vars->{ce}->{dbLayout});

	$WeBWorK::Constants::WEBWORK_DIRECTORY = config->{webwork_dir};
	$WeBWorK::Debug::Logfile = config->{webwork_dir} . "/logs/debug.log";
}

sub buildSession {

	my ($userID,$sessKey) = @_;
	if(! vars->{db}){ 
		send_error("The database object DB is not defined.  Make sure that you call setCourseEnvironment first.",404);
	}

	## need to check that the session hasn't expired. 

    if (!defined(session 'user')) {
    	if (defined($userID)){
	    	session user => $userID;
    	} else {
    		send_error("The user is not defined. You may need to authenticate again",401);	
    	}
	}

	my $key = vars->{db}->getKey(session 'user');
	my $timeLastLoggedIn = 0; 

	if(! defined($key)){
		debug "making a new key";
		my $newKey = createSession(session 'user');
		$key = vars->{db}->newKey(user_id=>(session 'user'), key=>$newKey);
	}

	session 'key' => $key->{key};

	if((session 'key') ne $sessKey){
		session 'logged_in' => 0;
		session 'timestamp' => 0;
		return;
	}
	unless (isSessionCurrent()) {
		return;
	}
	

	if (! defined(session 'permission')){
		my $permission = vars->{db}->getPermissionLevel(session 'user');
		session 'permission' => $permission->{permission};		
	}

	session 'logged_in' => 1;

	setCookie();
}

# this checks if the session is current by seeing if course_id, user_id, key is set and the timestamp is within a standard time. 

sub isSessionCurrent {
	return "" unless (session 'course');
	return "" unless (session 'user');
	return "" unless (session 'key');
	my $key = vars->{db}->getKey(session 'user');
	if(time() - $key->{timestamp} > vars->{ce}->{sessionKeyTimeout}){
		session 'logged_in' => 0;
		session 'timestamp' => 0;
		return "";
	} else {
		# update the timestamp in the database so the user isn't logged out prematurely.
		$key->{timestamp} = time();
		session 'timestamp' => $key->{timestamp};
		vars->{db}->putKey($key);
	}
	return 1;
}

sub checkPermissions {
	my $permissionLevel = shift;
	my $userID = session 'user';
	my $key = session 'key';

	buildSession($userID,$key);
	send_error('You are no longer logged in.  You may need to reauthenticate.',419) unless session 'logged_in';

	if(session('permission') < $permissionLevel){send_error($PERMISSION_ERROR,403)}

}

### Note: this was copied from WeBWorK::Authen.pm

# clobbers any existing session for this $userID
# if $newKey is not specified, a random key is generated
# the key is returned
sub createSession {
	my ($userID, $newKey) = @_;

	debug "ici";
	debug $userID;

	my $timestamp = time;
	unless ($newKey) {
		my @chars = @{ vars->{ce}->{sessionKeyChars} };
		my $length = vars->{ce}->{sessionKeyLength};
		
		srand;
		$newKey = join ("", @chars[map rand(@chars), 1 .. $length]);
	}
	
	my $Key = vars->{db}->newKey(user_id=>$userID, key=>$newKey, timestamp=>$timestamp);
	# DBFIXME this should be a REPLACE
	eval { vars->{db}->deleteKey($userID) };
	vars->{db}->addKey($Key);

	#if ($ce -> {session_management_via} eq "session_cookie"),
	#    then the subroutine maybe_send_cookie should send a cookie.

	return $newKey;
}


###
#
# This sets the cookie in the WW2 style to allow for seamless transfer back and forth. 

sub setCookie {
		my $cookieValue = (session 'user') . "\t". (session 'key') . "\t" . (session 'timestamp');

		my $hostname = vars->{ce}->{server_root_url};
		$hostname =~ s/https?:\/\///;

		if ($hostname ne "localhost" && $hostname ne "127.0.0.1") {
			cookie "WeBWorKCourseAuthen." . params->{course_id} => $cookieValue, domain=>$hostname;
		} else {
			cookie "WeBWorKCourseAuthen." . params->{course_id} => $cookieValue;
		}


}

### Course routes
##
#  These are the routes for all /course URLs in the RESTful webservice
#
##

package Routes::User;
use base qw(Exporter);

use Dancer2 appname => "Routes::Login";
use Dancer2::Plugin::Auth::Extensible;
use Utils::Convert qw/convertObjectToHash convertArrayOfObjectsToHash convertBooleans/;
use WeBWorK::Utils qw/cryptPassword/;

our @user_props = qw/first_name last_name student_id user_id email_address permission status
                    section recitation comment displayMode showOldAnswers useMathView/;
our @boolean_user_props = qw/showOldAnswers useMathView/;
our $PERMISSION_ERROR = "You don't have the necessary permissions.";

our @EXPORT    = ();
our @EXPORT_OK = qw(@boolean_user_props);

###
#  return all users for course :course
#
#  User user_id must have at least permissions>=10
#
##

get '/courses/:course/users' => require_role professor => sub {

    my @allUsers = vars->{db}->getUsers(vars->{db}->listUsers);
    my %permissionsHash =  reverse %{vars->{ce}->{userRoles}};
    foreach my $u (@allUsers)
    {
        my $PermissionLevel = vars->{db}->getPermissionLevel($u->{'user_id'});
        $u->{'permission'} = $PermissionLevel->{'permission'};

		my $studid= $u->{'student_id'};
		$u->{'student_id'} = "$studid";  # make sure that the student_id is returned as a string.

    }

    return convertArrayOfObjectsToHash(\@allUsers);
};



###
#
#  create a new user user_id in course *course_id*
#
###


post '/courses/:course_id/users/:user_id' => require_role professor => sub {

	my $enrolled = vars->{ce}->{statuses}->{Enrolled}->{abbrevs}->[0];
	my $user = vars->{db}->getUser(param('user_id'));
	send_error("The user with login " . param('user_id') . " already exists",404) if $user;
	$user = vars->{db}->newUser();

	# update the standard user properties

	for my $key (@user_props) {
        $user->{$key} = params->{$key} if (defined(params->{$key}));
    }
    $user->{_id} = $user->{user_id}; # this will help Backbone on the client end to know if a user is new or existing.

	# password record

	my $password = vars->{db}->newPassword();
	$password->{user_id}=params->{user_id};
	my $cryptedpassword = "";
	if (defined(params->{password})) {
		$cryptedpassword = cryptPassword(params->{password});
	}
	elsif (defined(params->{student_id})) {
		$cryptedpassword = cryptPassword(params->{student_id});
	}
	$password->password($cryptedpassword);



	# permission record

	my $permission = vars->{db}->newPermissionLevel();
	$permission->{user_id} = params->{user_id};
	$permission->{permission} = params->{permission};

	vars->{db}->addUser($user);
	vars->{db}->addPassword($password);
	vars->{db}->addPermissionLevel($permission);

	my $u =convertObjectToHash($user);
	$u->{_id} = $u->{user_id};

	return $u;

};

##
#
#  update an existing user
#
##

put '/courses/:course_id/users/:user_id' => require_any_role [qw/professor student/] => sub {

  ## if the user is a student, they can only change their own information.

  if (user_has_role('student') && (session 'logged_in_user') ne route_parameters->{user_id}){
    send_error("A user with the role of student can only change his/her own information", 403);
  }

	my $user = vars->{db}->getUser(route_parameters->{user_id});
	send_error("The user with login " . route_parameters->{user_id} . " does not exist",404) unless $user;



	# update the standard user properties


  my %allparams = params;
  my $setFromClient = convertBooleans(\%allparams,\@boolean_user_props);


  # if the user is a student, only allow changes to a few properties:

  if (user_has_role('professor')){
    for my $key (@user_props) {
      $user->{$key} = $setFromClient->{$key} if (defined(params->{$key}));
    }
  } else {
    for my $key (qw/email_address displayMode showOldAnswers userMathView/){
      $user->{key} = $setFromClient->{$key} if (defined(params->{$key}));
    }
  }

	vars->{db}->putUser($user);
	$user->{_id} = $user->{user_id}; # this will help Backbone on the client end to know if a user is new or existing.

  if (user_has_role('professor')){
    my $permission = vars->{db}->getPermissionLevel(params->{user_id});

    if(params->{permission} != $permission->{permission}){
      $permission->{permission} = params->{permission};
      vars->{db}->putPermissionLevel($permission);
    }
  }


	my $u =convertObjectToHash($user, \@boolean_user_props);

  $u->{_id} = $u->{user_id};  # helps Backbone on client-side to know the object is not new.

	return $u;

};



###
#
#  create a new user user_id in course *course_id*
#
###


del '/courses/:course_id/users/:user_id' => require_role professor => sub {

	# check to see if the user exists

	my $user = vars->{db}->getUser(param('user_id')); # checked
	send_error("Record for visible user " . param('user_id') . ' not found.',404) unless $user;

	if (param('user_id') eq session('user') )
	{
		send_error("You can't delete yourself from the course.",404);
	}

	my $del = vars->{db}->deleteUser(param('user_id'));

	if($del) {
		return convertObjectToHash($user);
	} else {
		send_error("User with login " . param('user_id') . ' could not be deleted.',400);
	}
};

####
#
# Gets the status (logged in or not) of all users.  Useful for the classlist manager.
#
####

get '/courses/:course_id/users/loginstatus' => require_role professor => sub {

	my @users = vars->{db}->listUsers();
	my @status = map {
		my $key = vars->{db}->getKey($_);
		{ user_id=>$_,
			logged_in => ($key and time <= $key->timestamp()+vars->{ce}->{sessionKeyTimeout}) ? JSON::true : JSON::false}
	} @users;

	return \@status;

};

# set a new password for user :user_id in course :course_id

post '/courses/:course_id/users/:user_id/password' => require_any_role [qw/professor student/] => sub {

  ## if the user is a student, they can only change their own information.

  if (user_has_role('student') && (session 'logged_in_user') ne route_parameters->{user_id}){
    send_error("A user with the role of student can only change his/her own password", 403);
  }

	my $user = vars->{db}->getUser(route_parameters->{user_id});
	send_error("The user with login " . route_parameters->{user_id} . " does not exist",404) unless $user;


	my $password = vars->{db}->getPassword(params->{user_id});
	if(crypt(params->{old_password}, $password->password) eq $password->password){
    	$password->{password} = cryptPassword(params->{new_password});
    	vars->{db}->putPassword($password);
        return {message => "password changed", success => 1}
	} else {
        return {message => "orig password not correct", success => 0}
	}
};


####
#
#  Get problems in set set_id for user user_id for course course_id
#
#  returns a UserSet
#
####

get '/courses/:course_id/sets/:set_id/users/:user_id/problems' => require_role professor => sub {

  if (! vars->{db}->existsGlobalSet(params->{set_id})){
  	send_error("The set " . params->{set_id} . " does not exist in course " . params->{course_id},404);
  }

  if (! vars->{db}->existsUserSet(params->{user_id}, params->{set_id})){
  	send_error("The user " . params->{user_id} . " has not been assigned to the set " . params->{set_id}
  				. " in course " . params->{course_id},404);
  }

  my $userSet = vars->{db}->getUserSet(params->{user_id},params->{set_id});

  my @problems = vars->{db}->getAllMergedUserProblems(params->{user_id},params->{set_id});

  if(request->is_ajax){
      return convertArrayOfObjectsToHash(\@problems);
  } else {  # a webpage has requested this
      template 'problem.tt', {course_id=> params->{course_id}, set_id=>params->{set_id}, user=>params->{user_id},
                                  problem_id=>params->{problem_id}, pagename=>"Problem Viewer",
                                  problems => to_json(convertArrayOfObjectsToHash(\@problems)),
                               	user_set => to_json(convertObjectToHash($userSet))};
  }
};


####
#
#  Get/update problem problem_id in set set_id for user user_id for course course_id
#
####

get '/users/:user_id/courses/:course_id/sets/:set_id/problems/:problem_id' => require_role professor => sub {

  my $problem = vars->{db}->getUserProblem(param('user_id'),param('set_id'),param('problem_id'));
  return convertObjectToHash($problem);
};

put '/users/:user_id/courses/:course_id/sets/:set_id/problems/:problem_id' => require_role professor => sub {

	my $problem = vars->{db}->getUserProblem(param('user_id'),param('set_id'),param('problem_id'));

  for my $key (keys (%{$problem})){
  	if(param($key)){
		    $problem->{$key} = param($key);
  	}
  }

    vars->{db}->putUserProblem($problem);

    return convertObjectToHash($problem);
};


return 1;

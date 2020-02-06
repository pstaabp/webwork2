### Library routes
##
#  These are the routes for all library functions in the RESTful webservice
#
##

package Routes::Settings;

our $PERMISSION_ERROR = "You don't have the necessary permissions.";

use Utils::CourseUtils qw/getCourseSettings/;
use Utils::GeneralUtils qw/writeConfigToFile getCourseSettingsWW2/;
use Dancer2 appname => "Routes::Login";
use Dancer2::Plugin::Auth::Extensible;

use Data::Dump qw/dump/;

####
#
#  get /courses/:course_id/settings
#
#  return an array of all course settings
#
###

get '/courses/:course_id/settings' => sub { # => require_role professor => sub {
  debug "in get /courses/:course_id/settings";
	return getCourseSettings(vars->{ce}, \&debug);
};

####
#
#  CRUD for /courses/:course_id/settings/:setting_id
#
#  returns the setting where the var is *setting_id*
#
###

get '/courses/:course_id/settings/:setting_id' => require_role professor => sub {

	my $ConfigValues = getConfigValues(vars->{ce});

	foreach my $oneConfig (@$ConfigValues) {
		foreach my $hash (@$oneConfig) {
			if (ref($hash)=~/HASH/){
				if ($hash->{var} eq params->{setting_id}){
					if($hash->{type} eq 'boolean'){
						$hash->{value} = $hash->{value} ? JSON::true : JSON::false;
					}
					return $hash;
				}
			}
		}
	}

	return {};
};


## save all settings

put '/courses/:course_id/setting' => sub {

	debug body_parameters->{value};

	my $ConfigValues = getCourseSettingsWW2(vars->{ce});
	foreach my $oneConfig (@$ConfigValues) {
		foreach my $hash (@$oneConfig) {
			if (ref($hash)=~/HASH/){
				if ($hash->{var} eq body_parameters->{var}){
					if($hash->{type} eq 'boolean'){
						$hash->{value} = body_parameters->{value} ? 1 : 0;
					} else {
						$hash->{value} = body_parameters->{value};
					}
					return writeConfigToFile(vars->{ce},$hash);
				}
			}
		}
	}

	return {};

};

## save one setting

put '/courses/:course_id/settings/:setting_id' => sub {

	debug body_parameters->{value};

	debug to_json(body_parameters->{value});

	my $ConfigValues = getCourseSettingsWW2(vars->{ce});
	foreach my $oneConfig (@$ConfigValues) {
		foreach my $hash (@$oneConfig) {
			if (ref($hash)=~/HASH/){
				if ($hash->{var} eq route_parameters->{setting_id}){
					if($hash->{type} eq 'boolean'){
						$hash->{value} = params->{value} ? 1 : 0;
					} else {
						$hash->{value} = params->{value};
					}
					return writeConfigToFile(vars->{ce},$hash,\&debug);
				}
			}
		}
	}

	return {};
};


1;

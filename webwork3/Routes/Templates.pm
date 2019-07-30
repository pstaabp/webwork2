## This contains all of the html templates for the app
package Routes::Templates;

use Dancer2;
use Dancer2::FileUtils qw/read_file_content/;
use Dancer2::Plugin::Auth::Extensible;  ## this handles the users and roles.  See the configuration file for setup.

use Utils::Convert qw/convertObjectToHash/;
use Utils::CourseUtils qw/getCourseSettings getAllSets getAllUsers/;
use WeBWorK::Utils::CourseManagement qw/listCourses/;
use WeBWorK::CourseEnvironment;
use WeBWorK::DB;
use Array::Utils qw/array_minus/;
#use Routes::User qw/@boolean_user_props/;

use Data::Dump qw/dump/;

any ['get','put','post','delete'] => '/**' => sub {
	send_file 'index.html';
};

true;

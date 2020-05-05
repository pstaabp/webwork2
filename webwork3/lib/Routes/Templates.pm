## This contains all of the html templates for the app
package Routes::Templates;

use Dancer2;
use Data::Dump qw/dump/;

hook before => sub {
	error "in hook before";
};

# get '/' => sub {
# 	warn "in get /";
# 	warn dump config;
#   return 'Hello World!';
# };

any ['get','put','post','delete'] => '/**' => sub {
	send_file 'index.html';
};

true;

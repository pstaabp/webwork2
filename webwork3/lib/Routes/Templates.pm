## This contains all of the html templates for the app
package Routes::Templates;

use Dancer2;
use Data::Dump qw/dump/;

use Dancer2::FileUtils qw/read_file_content path/;

get '/css/:file' => sub {
	send_file path('css',	route_parameters->get('file'));

};

get '/js/:file' => sub {
	send_file path('js',route_parameters->get('file'));
};


get '/hi' => sub {
	send_file 'test.html';
};

get '/**' => sub {
	send_file 'index.html';
};

true;

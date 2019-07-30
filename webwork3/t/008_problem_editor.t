###
#
#  This script tests routes associated with problem editing
#
###

use strict;
use warnings;


my $webwork_dir = "";
my $pg_dir = "";

BEGIN {
  $ENV{PLACK_ENV}='testing';

  $ENV{MOD_PERL_API_VERSION}=2;  # ensure that mod_perl2 is used.
  $webwork_dir = $ENV{WEBWORK_ROOT} || die "The environment variable WEBWORK_ROOT needs to be defined.";
  $pg_dir = $ENV{PG_ROOT};

  if (not defined $pg_dir) {
    $pg_dir = "$webwork_dir/../pg";
  }

  die "The directory $webwork_dir does not exist" if (not -d $webwork_dir);
  die "The directory $pg_dir does not exist" if (not -d $pg_dir);

}

use lib "$webwork_dir/lib";
use lib "$webwork_dir/webwork3/lib";
use lib "$pg_dir/lib";

use Routes::Login;

use Test::More;
use Test::Deep;
use Plack::Test;
use JSON;
use HTTP::Request::Common;
use HTTP::Cookies;
use List::Util qw/first/;

use Data::Dump qw/dd dump/;

my $app = Routes::ProblemSets->to_app;
my $url  = 'http://localhost';
my $test = Plack::Test->create($app);

my $jar  = HTTP::Cookies->new();

subtest 'login to admin course and create a new course_zyx' => sub {
  my $req =  POST "$url/courses/admin/login?username=admin&password=admin";

  my $res = $test->request($req);
  $jar->extract_cookies($res);
  my $result_hash =  decode_json($res->content);

  ok($result_hash->{logged_in}, '[POST /courses/admin/login] using query params successful');

  ## check if new_course_xyz exists.

  $req = GET "$url/admin/courses/new_course_xyz";
  $jar->add_cookie_header($req);
  $res = $test->request($req);

  $result_hash = decode_json($res->content);
    ok($res->is_success, '[GET /admin/courses/new_course_xyz] checked if course exists');
  ok(! $result_hash->{course_exists}, 'The course new_course_xyz does not exist');

  my $params = {
    new_user_id=>"profa",
    new_user_first_name =>"Professor",
    new_user_last_name =>"A",
    initial_password =>"profa"
  };

  $req = HTTP::Request->new(
    "POST","$url/admin/courses/new_course_xyz",
    HTTP::Headers->new('Content-Type' => 'application/json'),
    encode_json($params)
  );
  $jar->add_cookie_header($req);

  $res = $test->request($req);
  ok($res->is_success, '[POST /admin/courses/new_course_id] successfully created a new course');
};


subtest 'get a blank problem' => sub {
  my $req = GET "$url/courses/new_course_xyz/blank_problem";
  $jar->add_cookie_header($req);
  my $res = $test->request($req);
  my $result_hash = decode_json($res->content);
  dd $result_hash;
  ok($res->is_success, '[GET /courses/new_course_xyz/blank_problem] successful');


};


### delete the course courseXYz


subtest 'delete a course' => sub {
  my $req =  POST "$url/courses/admin/login?username=admin&password=admin";

  my $res = $test->request($req);
  $jar->extract_cookies($res);

  $req =  HTTP::Request->new("DELETE","$url/admin/courses/new_course_xyz");
  $jar->add_cookie_header($req);
  $res = $test->request($req);
  ok($res->is_success, '[DELETE /admin/courses/new_course_xyz] successfully deleted the course');
};

done_testing();

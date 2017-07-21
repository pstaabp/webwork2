use strict;
use warnings;


my $webwork_dir = "";
my $pg_dir = "";

BEGIN {
  #$ENV{PLACK_ENV}='testing';
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
use HTML::Entities qw/decode_entities encode_entities/;

use Utils::LibraryUtils qw/searchLibrary/;

use Data::Dump qw/dd dump/;

my $app = Routes::Login->to_app;
my $url  = 'http://localhost';
my $test = Plack::Test->create($app);
my $jar  = HTTP::Cookies->new();


subtest 'login to admin course and create a new course_zyx' => sub {
  my $req =  POST "$url/courses/admin/login?username=admin&password=admin";

  my $res = $test->request($req);
  $jar->extract_cookies($res);
  my $res_as_obj =  decode_json($res->content);

  ok($res_as_obj->{logged_in}, '[POST /courses/admin/login] using query params successful');

  ## check if new_course_xyz exists.

  $req = GET "$url/admin/courses/new_course_xyz";
  $jar->add_cookie_header($req);
  $res = $test->request($req);

  $res_as_obj = decode_json($res->content);
    ok($res->is_success, '[GET /admin/courses/new_course_xyz] checked if course exists');
  ok(! $res_as_obj->{course_exists}, 'The course new_course_xyz does not exist');

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

subtest 'Login to new course as profa' => sub {
  my $req =  POST "$url/courses/new_course_xyz/login?username=profa&password=profa";
  my $res = $test->request($req);
  $jar->extract_cookies($res);
  my $res_as_obj =  decode_json($res->content);

  ok($res_as_obj->{logged_in}, '[POST /courses/new_course_xyz/login] successfully logged in');

};

subtest 'Load the Library Subject, directory and Textbook databases' => sub {
   my $req =  GET "$url/Library/subjects";
   $jar->add_cookie_header($req);
   my $res = $test->request($req);
   ok($res->is_success,"[GET $url/Library/subjects] returned successfully");
   my $subjects =  decode_json($res->content);
   ok(ref($subjects) eq "ARRAY",'The Library Subject Database is an ARRAY');
   my $num_subjs = scalar(@{$subjects});
   ok($num_subjs > 0,"The Library subject database has $num_subjs subjects.");


   # load the library directory tree.
   $req =  GET "$url/Library/directories";
   $jar->add_cookie_header($req);
   $res = $test->request($req);
   ok($res->is_success,"[GET $url/Library/directories] returned successfully");
   my $directories =  decode_json($res->content);
   ok(ref($directories) eq "ARRAY",'The Library directory database is an ARRAY');
   my $num_dirs = scalar(@{$subjects});
   ok($num_dirs > 0,"The Library subject database has $num_subjs highest-level directorys.");

   # load the library textbook tree.
   $req =  GET "$url/Library/textbooks";
   $jar->add_cookie_header($req);
   $res = $test->request($req);
   ok($res->is_success,"[GET $url/Library/textbooks] returned successfully");

   my $textbooks =  decode_json($res->content);
   ok(ref($textbooks) eq "ARRAY",'The Library textbooks database is an ARRAY');
   my $num_texts = scalar(@{$textbooks});
   ok($num_texts > 0,"The Library subject database has $num_texts textbooks.");



};

subtest 'Find some problems by subject' => sub {
  my $subject = "Geometry";
  my $req =  GET "$url/Library/subjects/$subject/problems";
  $jar->add_cookie_header($req);
  my $res = $test->request($req);
  ok($res->is_success,"[GET $url/Library/subjects/$subject/problems] returned successfully");
  my $problems =  decode_json($res->content);
  ok(ref($problems) eq "ARRAY",'The problems are returned in an array');
  my $num_problems = scalar(@{$problems});
  ok($num_problems > 0, "The library has $num_problems problems in the $subject subject.");
};

subtest 'Find some problems by subject and chapter' => sub {
  my $subject = "Geometry";
  my $chapter = "Shapes";

  my $req =  GET "$url/Library/subjects/$subject/chapters/$chapter/problems";
  $jar->add_cookie_header($req);
  my $res = $test->request($req);
  ok($res->is_success,"[GET $url/Library/subjects/$subject/chapters/$chapter/problems] returned successfully");
  my $problems =  decode_json($res->content);
  ok(ref($problems) eq "ARRAY",'The problems are returned in an array');
  my $num_problems = scalar(@{$problems});
  ok($num_problems > 0, "The library has $num_problems problems in the $subject/$chapter.");
};

subtest 'Find some problems by subject and chapter and section' => sub {
  my $subject = "Geometry";
  my $chapter = "Shapes";
  my $section = "Area";

  my $req =  GET "$url/Library/subjects/$subject/chapters/$chapter/sections/$section/problems";
  $jar->add_cookie_header($req);
  my $res = $test->request($req);
  ok($res->is_success,"[GET $url/Library/subjects/$subject/chapters/$chapter/sections/$section/problems] returned successfully");
  my $problems =  decode_json($res->content);
  ok(ref($problems) eq "ARRAY",'The problems are returned in an array');
  my $num_problems = scalar(@{$problems});
  ok($num_problems > 0, "The library has $num_problems problems in the $subject/$chapter/$section.");
};

subtest 'Find some problems by author/textbook' => sub {
  my $author = "Anton";
  my $title = "Calculus";
  my $req =  GET "$url/Library/textbooks/author/$author/title/$title/problems";
  $jar->add_cookie_header($req);
  my $res = $test->request($req);
  ok($res->is_success,"[GET $url/Library/textbooks/author/$author/title/$title/problems] returned successfully");
  my $problems =  decode_json($res->content);
  ok(ref($problems) eq "ARRAY",'The problems are returned in an array');
  my $num_problems = scalar(@{$problems});
  ok($num_problems > 0, "The library has $num_problems problems in the textbook/author: $title/$author.");
};

subtest 'Find some problems by author/textbook/chapter' => sub {
  my $author = "Anton";
  my $title = "Calculus";
  my $chapter = "Differentiation";
  my $req =  GET "$url/Library/textbooks/author/$author/title/$title/chapter/$chapter/problems";
  $jar->add_cookie_header($req);
  my $res = $test->request($req);
  ok($res->is_success,"[GET $url/Library/textbooks/author/$author/title/$title/chapter/$chapter/problems] returned successfully");
  my $problems =  decode_json($res->content);
  ok(ref($problems) eq "ARRAY",'The problems are returned in an array');
  my $num_problems = scalar(@{$problems});
  ok($num_problems > 0, "The library has $num_problems problems in the textbook/author/chapter: $title/$author/$chapter.");
};

subtest 'Find some problems by author/textbook/chapter/section' => sub {
  my $author = "Anton";
  my $title = "Calculus";
  my $chapter = "Differentiation";
  my $section = "Definition of the derivative";
  my $req =  GET encode_entities  "$url/Library/textbooks/author/$author/title/$title/chapter/$chapter/section/$section/problems";
  $jar->add_cookie_header($req);
  my $res = $test->request($req);
  ok($res->is_success,"[GET $url/Library/textbooks/author/$author/title/$title/chapter/$chapter/section/$section/problems] returned successfully");
  my $problems =  decode_json($res->content);
  ok(ref($problems) eq "ARRAY",'The problems are returned in an array');
  my $num_problems = scalar(@{$problems});
  ok($num_problems > 0, "The library has $num_problems problems in the textbook/author/chapter/section: $title/$author/$chapter/$section.");
};

subtest 'Find problems on other search criteria' => sub {
  my $params = {level => 2};

  my $req = HTTP::Request->new(
    "POST","$url/Library/problems",
    HTTP::Headers->new('Content-Type' => 'application/json'),
    encode_json($params)
  );
  $jar->add_cookie_header($req);
  my $res = $test->request($req);
  ok($res->is_success,"[POST /Library/problems] with level=>2");
  my $problems =  decode_json($res->content);
  ok(ref($problems) eq "ARRAY",'The problems are returned in an array');
  my $num_problems = scalar(@{$problems});
  ok($num_problems > 0, "The library has $num_problems problems with level=>2");

  $params = {author => "Holt"};
  $req = HTTP::Request->new(
    "POST","$url/Library/problems",
    HTTP::Headers->new('Content-Type' => 'application/json'),
    encode_json($params)
  );
  $jar->add_cookie_header($req);
  $res = $test->request($req);
  ok($res->is_success,"[POST /Library/problems] with author:Holt");
  $problems =  decode_json($res->content);
  ok(ref($problems) eq "ARRAY",'The problems are returned in an array');
  $num_problems = scalar(@{$problems});
  ok($num_problems > 0, "The library has $num_problems problems with author:Holt");

  ## do more testing on general search.


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

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

use Test::More;
use Data::Dump qw/dd/;

use Utils::LibraryUtils qw/search/;

# subtest 'test create a model' => sub {
#   my $params = {
#     author_id => 38,
#     DBchapter => "Vector geometry",
#     DBsection => "Dot product, length, and unit vectors",
#     DBsubject => "Geometry",
#     file_path => "AlfredUniv/anton8e/chapter12/12.3/inclined_plane.pg",
#     filename => "inclined_plane.pg",
#     id => 34726,
#     level => 2,
#     path => "AlfredUniv/anton8e/chapter12/12.3",
#   };
#
#   my $prob = Models::Library::Problem->new($params);
#
#   dd $prob;
# }

#dd  search({ DBsubject => "Geometry" });

dd search({title => "The Basic Practice of Statistics"});

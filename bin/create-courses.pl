#!/usr/bin/perl

=head1 NAME

create-courses - creates a number of courses with file

=head1 SYNOPSIS

 create-courses [options]

=head1 DESCRIPTION

Create any number of courses and populate them with

=head1 OPTIONS

=over

=item B<--db-layout>=I<LAYOUT>

The specified database layout will be used in place of the default specified in
F<defaults.config>.

=item B<--users>=I<FILE>

The users listed in the comma-separated text file I<FILE> will be added to the
user list of the new course. The format of this file is the same as user lists
exported from WeBWorK.

=item B<--professors>=I<USERID>[,I<USERID>]...

Each I<USERID>, if it is present in the new course's user list, will be granted
professor privileges (i.e. a permission level of 10). Requires B<--users>.

=item B<--templates-from>=I<COURSEID>

If specified, the contents of the specified course's templates directory are
used to populate the new course's templates directory.

=item I<COURSEID>

The name of the course to create.

=back

=cut

use strict;
use warnings;
use feature 'say';
use Moo;
use MooX::Options;
use YAML qw/LoadFile/;
use File::Spec;
use Data::Dump qw(dd);
use File::Basename;
use File::Slurp;

BEGIN {
	die "WEBWORK_ROOT not found in environment.\n"
		unless exists $ENV{WEBWORK_ROOT};
    my $webwork_dir = $ENV{WEBWORK_ROOT};
	  print "addcourse:  WeBWorK root directory set to $webwork_dir\n";

	# link to WeBWorK code libraries
      eval "use lib '$webwork_dir/lib'"; die $@ if $@;
      eval "use lib '$webwork_dir/webwork3/lib'"; die $@ if $@;

}

use WeBWorK::CourseEnvironment;
use WeBWorK::DB;
use Utils::Users qw/add_one_user/;



my $webwork_dir = $ENV{WEBWORK_ROOT};

my $overall_ce = WeBWorK::CourseEnvironment->new({webwork_dir => $webwork_dir});
my $admince = new WeBWorK::CourseEnvironment({ webwork_dir => $webwork_dir,courseName=> "admin"});
my $admindb = WeBWorK::DB->new($admince->{dbLayout});
my $adminPerm = $admindb->newPermissionLevel();
$adminPerm->user_id("admin");
$adminPerm->permission($admince->{userRoles}->{admin});
my $adminUser            = $admindb->getUser("admin");
my $adminPassword        = $admindb->getPassword("admin");



option 'input_file' => (is => 'ro', format=>'s', short => 'i',
        repeatable => "", required => "", doc => "Input File (classlist from banner)");

option 'output_file' => (is => 'ro', format=>'s',short => 'o',
      repeatable => "", required => "", doc => "output file (webwork classlist file)");

option 'input_dir' => (is => 'ro', format=>'s', short => 'd', repeatable=> "",
      doc => "Input Directory");

option 'output_dir' => (is => 'ro', format=>'s', short => 'D', repeatable=> "",
      doc => "Output Directory");

option 'class_file' => (is => 'ro', format=>'s', short => 'f', repeatable=> "", required=>1,
            doc => "YAML file containing a list of all courses.");
option 'add_users' => (is=>'ro', short=>'a',doc=>"A switch on whether or not to add the users");

option 'create_courses' => (is=>'ro', short => 'c', repeatable => "",
            doc => "Create the courses in the specified YAML file");

##
# This takes a classlist from Banner and creates a classlist file (ww format).
##

sub create_classlist_file {

  my ($self) = @_;

  my $verbose =1;
  my $input_dir = $self->input_dir;
  my $output_dir = $self->output_dir;
  my $classes_file = $self->class_file;

  my $classes = LoadFile($classes_file);
  ## check that each of the class list files in the $classes_files exists and is readable;
  for my $class (@{$classes}){
    my $text_file = File::Spec->catfile($input_dir,$class->{text_file});

    my($filename, $dirs, $suffix) = fileparse($text_file,".txt");
    my $cl_file = File::Spec->catfile($output_dir,$filename.".lst");
    open  FILE, "<", $text_file or die $!;
    say "successfully read from $text_file" if $verbose;
    open FILE1, ">", $cl_file or die $!;
    #
    while (<FILE>) {
      $_ =~ s/^\s+|\s+$//g;
      my @fields = split(/\s\s+/, $_);
      if (scalar @fields == 4){
        my ($id,$last,$first,$email) = @fields;
        my ($login) = split(/@/,$email);
        print FILE1 $id . "," . $last . "," . $first . ",,,,," . $email . "," . $login . ",,0\n";
      }
    }

    close FILE;
    close FILE1;
    say "Wrote the results to $cl_file" if $verbose;

  }
}

###
#
#  this checks to make sure all of the directories exist and can be read
#
###

sub check {
  my ($self) = @_;
  # check if the directories exist
  my $input_dir = $self->input_dir // "";
  my $output_dir = $self->output_dir // "";
  my $classes_file = $self->class_file // "";

  warn "The input directory $input_dir does not exist" unless (-d $input_dir);
  warn "The output directory $output_dir does not exist" unless (-d $output_dir);

  if ($classes_file) {
    warn "The classlist file $classes_file does not exist" unless (-e $classes_file);

    my $classes = LoadFile($classes_file);

    ## check that each of the class list files in the $classes_files exists and is readable;
    for my $class (@{$classes}){

      my $classlists = $class->{classlists} || [];
      # dd $classlists;
      for my $cl (@$classlists){
        #dd $cl;
        warn "The file $cl does not exist" unless (-e $input_dir ."/".$cl);
        my $cl_file = File::Spec->catfile($input_dir,$cl);
      }

      ## check that if a previous course is indicated that the course exists.

      if($class->{previous_course}){
        my $prev_course_path = $overall_ce->{webworkDirs}->{courses} . "/" . $class->{previous_course};
        warn "The course $prev_course_path does not exist." unless ( -d $prev_course_path);
      }
    }
  }

}

sub add_users_to_courses {
  my ($self)=@_;

  my $classes = LoadFile($self->class_file);
  ## check that each of the class list files in the $classes_files exists and is readable;
  for my $class (@{$classes}){
    my $text_file = File::Spec->catfile($self->input_dir,$class->{text_file});
    my($filename, $dirs, $suffix) = fileparse($text_file,".txt");
    my $cl_file = File::Spec->catfile($self->output_dir,$filename.".lst");
    my $ww_course = $class->{ww_course};
    my $out = `perl /opt/webwork/webwork2/bin/addusers --users=$cl_file $ww_course`;
    say $out;
  }
}

sub create_course {
  my ($self) = @_;
  die "The file " . $self->class_file . " does not exist" unless (defined($self->class_file) && -e $self->class_file);

  my $classes = LoadFile($self->class_file);
  ## check that each of the class list files in the $classes_files exists and is readable;
  for my $class (@{$classes}){
     ## create a temporary file that makes a classlist for just the single professor
     my $params = {
       user_id => $class->{prof},
       last_name => $class->{prof_last_name},
       first_name => $class->{prof_first_name},
       password => $class->{prof_password},
       permission => 10
     };
    my $course_name = $class->{course_name};
    my $addCoursePath = $overall_ce->{webworkDirs}->{bin} . "/addcourse";
    dd $addCoursePath;
    my $out = `perl $addCoursePath $course_name`;
    dd $out;
    ## add the admin user to the course
    my $ce = new WeBWorK::CourseEnvironment({ webwork_dir => $webwork_dir,courseName=> $course_name });
    my $db = new WeBWorK::DB($ce->{dbLayout});

    add_one_user($db,$params);
    $db->addUser($adminUser);
    $db->addPassword($adminPassword);
   }
}


sub run {
    my ($self) = @_;

    $self->check;

    if($self->create_courses){
      $self->create_course;
    } else {


    $self->create_classlist_file;

    if ($self->add_users){
      $self->add_users_to_courses
    }
  }
}

main->new_with_options->run;

1;

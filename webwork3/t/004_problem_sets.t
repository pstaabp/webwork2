use Test::More tests => 7;
use Test::Deep qw/cmp_deeply/;
use strict;
use warnings;
use JSON qw/from_json/;
use Data::Dump qw/dd dump/;
use DateTime; 
use List::Util qw(first);
use List::MoreUtils qw/nsort_by/;

use Utils::Convert qw/convertBooleans/;
use Utils::ProblemSets qw/@boolean_set_props/;
use feature 'say';

BEGIN {$ENV{MOD_PERL_API_VERSION}=2}

# the order is important
use WeBWorK3;
Dancer::set logger => 'console';
#Dancer::set log => 'core';
use Dancer::Test;


## login to the admin course
my $new_course_name = "newcourseXYZ"; 

my $resp = dancer_response(POST=>'/courses/admin/login',{params=>{user=>'admin',password=>'admin'}});
my $obj = from_json $resp->{content};
is($obj->{logged_in},1,"You successfully logged in to the admin course");

## see if the course $new_course_name already exists. 
route_exists [GET => '/courses/'. $new_course_name ], "GET /webwork3/courses/" . $new_course_name . " is handled";

## check if the course $new_course_name exists.
$resp = dancer_response(GET=>'/courses/'. $new_course_name, {headers=>HTTP::Headers->new( 'X-Requested-With' => 'XMLHttpRequest')});
$obj = from_json $resp->{content};

my $course_exists = ($obj->{message} ||"") eq "Course exists."; 

if($course_exists) {
    is($obj->{message}, "Course exists.", "The course " .$new_course_name . " exists."); 
    
} else {
    ## create a new course called $new_course_name 
    $resp = dancer_response(POST=>"/courses/$new_course_name", 
            {params=>{user=>'admin',password=>'admin',new_userID => 'profa'}});
    $obj = from_json $resp->{content};

    is($obj->{message},"Course created successfully.","The course " . $new_course_name . " was created sucessfully.");
}

## login to the course $new_course_name as profa

$resp = dancer_response(POST=>"/courses/$new_course_name/login",{params=>{user=>'profa',password=>'profa'}});
$obj = from_json $resp->{content};
is($obj->{logged_in},1,"You successfully logged in to the $new_course_name course");


### we want to start without any problem sets, so we'll delete any we find

$resp = dancer_response(GET=>"/courses/$new_course_name/sets");
my $sets = from_json $resp->{content}; 

for my $set (@$sets) {
    $resp = dancer_response(DELETE=>"/courses/$new_course_name/sets/" . $set->{set_id});
}



## Create a new Problem set that is open today at 10am, has a reduced scoring date 1 week later, a due date 2 days after that 
## and a answer_date 3 after that. 

my $now = DateTime->today(time_zone=>"America/New_York");
my $open_date = DateTime->new(year=>$now->year(),month=>$now->month(),day=>$now->day(),
                    hour=>10,minute=>0,second=>0,time_zone=>"America/New_York");
my $reduced_scoring_date = $open_date->clone()->add(days=>7);
my $due_date = $reduced_scoring_date->clone()->add(days=>2);
my $answer_date = $due_date->clone()->add(days=>3); 

my $set = { set_id => "set1", open_date => $open_date->epoch(), reduced_scoring_date => $reduced_scoring_date->epoch(),
                due_date => $due_date->epoch(), answer_date => $answer_date->epoch(), assigned_users => [], problems => [],
                hide_hint => 0, problems_per_page => '', versions_per_interval => '', time_interval => '', hide_score => '',
                attempts_per_version => '',restricted_login_proctor => '', version_creation_time => '', _id => "set1",
                set_header => 'defaultHeader', hardcopy_header => 'defaultHeader', restrict_ip => '', hide_score_by_problem => '',
                problem_randorder => 0, description=>'', hide_work => '', restricted_status => '',
                version_time_limit => '', relax_restrict_ip => '', restricted_release => '', version_last_attempt_time => '',
                visible => 0, enable_reduced_scoring => 0, time_limit_cap => 0, assignment_type => "default",
                email_instructor => '', restrict_prob_progression => ''}; 


$resp = dancer_response(POST=>"/courses/$new_course_name/sets/set1",{params=>$set});
$obj = from_json $resp->{content};

my $obj2 = convertBooleans($obj,\@boolean_set_props);

cmp_deeply $obj2, $set, "A set with id set1 has successfully been created.";


### change the open_date, due_date, reduced_scoring_date and answer_date and update the db

my $updated_set = {%$set};  # make a copy of the set

$updated_set->{open_date} = $open_date->clone()->subtract(days=>5)->epoch();
$updated_set->{reduced_scoring_date} = $reduced_scoring_date->clone()->subtract(days=>3)->epoch(); 
$updated_set->{due_date} = $due_date->clone()->add(days=>1)->epoch();
$updated_set->{answer_date} = $answer_date->clone()->add(days=>3)->epoch(); 

$resp = dancer_response(PUT=>"/courses/$new_course_name/sets/set1",{params=>$updated_set});
$obj = from_json $resp->{content};

$obj2 = convertBooleans($obj,\@boolean_set_props);

cmp_deeply $obj2, $updated_set, "A set with id set1 has successfully been updated.";

####  populate the set with problems

my @probSources = qw! Library/Utah/Quantitative_Analysis/set1_Preview/q9.pg
                        Library/Utah/Intermediate_Algebra/set3_Linear_Equations_and_Inequalities/s3p12.pg
                        Library/Utah/College_Algebra/set2_Functions_and_Their_Graphs/1050s2p32.pg
                        Library/Utah/College_Algebra/set2_Functions_and_Their_Graphs/1050s2p33.pg
                        Library/Utah/Calculus_II/set7_Infinite_Series/set7_pr18.pg!;
my $i=1; 
my @problems = map { createProblem("set1",$i++, $_);} @probSources; 

$set->{problems} = \@problems; 

$resp = dancer_response(PUT=>"/courses/$new_course_name/sets/set1",{params=>$set});
$obj = from_json $resp->{content};

$obj2 = convertBooleans($obj,\@boolean_set_props);

cmp_deeply $obj2, $set, "A set with id set1 has successfully been added problems.";

### reorder problems

## set the problem with id=4 to id=1 and shift all others by one

my $order = {"1"=>"2", "2"=>"3", "3"=>"4", "4"=>"1","5"=>"5"};

my @new_order = (); 

dd $set->{problems};

for my $id (keys %$order){
   my $prob = first {$_->{problem_id} eq $id} @{$set->{problems}}; 
   $prob->{_old_problem_id} = $id; 
   $prob->{problem_id} = $order->{$id}; 
   push(@new_order,$prob); 
}

$set->{problems} = nsort_by { dd $_; $_->{problem_id} } @new_order; 

#dd $set->{problems};


### delete a problem


### change parameters on a problem. 



















sub createProblem {
    my ($setID, $problemID, $sourceFile) = @_;

    return { att_to_open_children => "", counts_parent_grade => "", data => "", flags => "",
                max_attempts => 1, problem_id => $problemID, problem_seed => 1, set_id => $setID, _id => $setID . ":" . $problemID,
                showMeAnother => "", showMeAnotherCount => "", source_file => $sourceFile, value => 1 };
}
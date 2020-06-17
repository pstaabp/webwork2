## Render routes
##
#  These are the routes for all rendering functions in the RESTful webservice
#
#
##

package Routes::Render;

use Dancer2 appname => "Routes::Login";

use WeBWorK::Utils::Tasks qw/fake_user fake_set fake_problem/;

use Utils::RenderUtils qw/render recordResults/;
use Data::Dump qw/dump/;


  ###
  #
  # Problem render.  Given information about the problem (problem_id, set_id, course_id, or path) return the
  # HTML for the problem.
  #
  #  The displayMode parameter will determine the exact HTML code that is returned (images, MathJax, plain, PDF)
  #
  #  The intention of this route is for rendering a particular problem (i.e. for the library browser)
  #
  ###

  any ['get', 'put', 'post'] => '/courses/:course_id/render/problems/:problem_id' => sub {

    my $renderParams = {
      displayMode => query_parameters->get('displayMode') ||
          body_parameters->get("displayMode") ||
          vars->{ce}->{pg}{options}{displayMode},
      showHints => (query_parameters->get('showHints') ||
                body_parameters->get("showHints") || "false") eq 'true'? 1:0,
      showSolutions => (query_parameters->get('showSolutions') ||
                body_parameters->get("showSolutions") || "false") eq 'true'? 1:0,
      showAnswers => 0,
      problem => {
        problem_seed => query_parameters->get('problem_seed') || body_parameters->get("problem_seed") || 1,
        problem_id => query_parameters->get('problem_id') || body_parameters->get("problem_id") || 1,
      }
    };

    # check to see if the problem_path is defined

    if (defined(params->{pgSource})){
      $renderParams->{problem}->{pgSource} = params->{pgSource} ;
    } elsif (defined(params->{problem_path})){
      $renderParams->{problem}->{source_file} = "Library/" . params->{problem_path};
    } elsif (defined(params->{source_file})){  # this is generally a library problem
    $renderParams->{problem}->{source_file} = params->{source_file};
    # get the pgfile_id #
    my $file = file(params->{source_file});
    my $path = $file->dir->stringify;
    $path =~ s/Library\///;
    my $pathdb = database->quick_select('OPL_path',{path=>$path});
    my $path_id = $pathdb->{path_id} if $pathdb;
    my $pgfile = database->quick_select('OPL_pgfile',{path_id => $path_id, filename=> $file->basename});
    my $pgfile_id = 0;  # needed for a fix.  Why doesn't a pgfile have an id?
    $pgfile_id = $pgfile->{pgfile_id} if $pgfile;
    $renderParams->{problem}->{problem_id} = $pgfile_id;
  } elsif ((params->{problem_id} =~ /^\d+$/) && (params->{problem_id} > 0)){
    # try to look up the problem_id in the global database;
    my $problem_info = database->quick_select('OPL_pgfile', {pgfile_id => route_parameters->{problem_id}});
    my $path_id = $problem_info->{path_id};
    my $path_header = database->quick_select('OPL_path',{path_id=>$path_id})->{path};
    $renderParams->{problem}->{source_file} = file("Library" ,$path_header , $problem_info->{filename})->stringify;
  }

  my $rp = render(vars->{ce},vars->{db},$renderParams,\& debug);
  my $filepath = file(vars->{ce}->{problemLibrary}->{root}, $renderParams->{problem}->{source_file});
  #$rp->{tags} = getProblemTags($renderParams->{problem}->{source_file});  # lookup the tags using the source_file.
  #$rp->{tags} = getProblemTagsFromDB(-1);
  $rp->{render_errors} = $rp->{errors}; # new ww3 has this reserved.
  delete $rp->{errors};
  return $rp;
};


###
#
# Problem render for a UserProblem.  Given information about the problem (problem_id, set_id, course_id, or path) return the
# HTML for the problem.
#
#  The displayMode parameter will determine the exact HTML code that is returned (images, MathJax, plain, PDF)
#
#  If the request is a post, then it is assumed that the answers are submitted to be recorded.
#
###

any ['get', 'post'] => '/courses/:course_id/render/users/:user_id/sets/:set_id/problems/:problem_id' => sub {

  my $user_id = route_parameters->get('user_id');
  my $set_id = route_parameters->get('set_id');
  my $problem_id = route_parameters->get('problem_id');

  send_error("The set $set_id does not exist.",404) unless vars->{db}->existsGlobalSet($set_id);

  send_error("The problem with id $problem_id does not exist in set $set_id")
    unless vars->{db}->existsGlobalProblem($set_id,$problem_id);

  send_error("The user $user_id is not assigned to the set $set_id.")
    unless vars->{db}->existsUserSet($user_id,$set_id);

  send_error("The problem with id: $problem_id is not in the set")
    unless vars->{db}->existsUserProblem($user_id,$set_id,$problem_id);


  my $renderParams = {};

  $renderParams->{displayMode} = query_parameters->get('displayMode') ||
                                  body_parameters->get('displayMode') ||
                                  vars->{ce}->{pg}{options}{displayMode};
  $renderParams->{key} = session 'key';

  ### The user is not a professor

  if((session 'permission') < 10){  ### check that the user belongs to the course and set.

    send_error("You are a student and must be assigned to the set $set_id.",404)
      unless (vars->{db}->existsUser($user_id) &&  vars->{db}->existsUserSet($user_id,$set_id));

    # these should vary depending on number of attempts or due_date or ???
    $renderParams->{showHints} = 0;
    $renderParams->{showSolutions} = 0;
    $renderParams->{showAnswers} = 0;

  } else {
    my $show_hints = body_parameters->get('show_hints') || query_parameters->get('show_hints');
    my $show_solutions = body_parameters->get('show_solutions') || query_parameters->get('show_solutions');
    my $show_answers = body_parameters->get('show_answers') || query_parameters->get('show_answers');
    my $check_answers = body_parameters->get('checkAnswers') || query_parameters->get('checkAnswers');

    $renderParams->{showHints} = defined($show_hints)? int($show_hints) : 0;
    $renderParams->{showSolutions} = defined($show_solutions)? int($show_solutions) : 0;
    $renderParams->{showAnswers} = defined($show_answers)? int($show_answers) : 0;
    $renderParams->{checkAnswers} = defined($check_answers) ? int($check_answers) : 0;

  }

  $renderParams->{problem} = vars->{db}->getMergedProblem($user_id,$set_id,$problem_id);
  $renderParams->{user} = vars->{db}->getUser($user_id);
  $renderParams->{set} = vars->{db}->getMergedSet($user_id,$set_id);
  $renderParams->{checkAnswers} = body_parameters->get('checkAnswers') || query_parameters->get('checkAnswers') || 0;
  $renderParams->{submitAnswers} = body_parameters->get('submitAnswers') || query_parameters->get('submitAnswers') || 0;


  $renderParams->{answers} = body_parameters->get('answers');

  my ($results,$pg,$form_data) = render(vars->{ce},vars->{db},$renderParams,\&debug);

  ## if it was a post request and the user submitted answers,
  ##  then we record the the results in the log file and in the past_answer database
  if(request->is_post &&  $renderParams->{submitAnswers}){
    $results->{recorded_msg} = recordResults(vars->{ce},vars->{db},$pg,
                                    $renderParams->{set},$renderParams->{problem},$form_data,\&debug);
  }

  return $results;
};



## This subroutine is used by renders to fill all params passed in
## and returns a set of a parameters used to render.

sub parseParams {
  my ($db,$body_params,$query_params) = @_;

  my $user_id = $body_params->get('user_id') || $query_params->get('user_id');
  my $set_id = $body_params->get('set_id') || $query_params->get('set_id');
  my $problem_id = $body_params->get('problem_id') || $query_params->get('problem_id');
  my $problem;

  if($user_id && $set_id && $problem_id){
    $problem = $db->getUserProblem($user_id,$set_id,$problem_id);
  }
  $problem = fake_problem($db) unless defined($problem);

  my $set = $db->getMergedSet($user_id,$set_id) if ($user_id && $set_id);
  $set = $db->getGlobalSet($set_id) if $set && ! defined($set);
  $set = fake_set($db) unless $set;


  $problem->{problem_seed} = ( $body_params->get('problem_seed') || $query_params->get('problem_seed') || 1)
    unless defined($problem->{problem_seed});

  $problem->{source_file} = ( $body_params->get('source_file') || $query_params->get('source_file') )
    unless $problem->{source_file};
  $problem->{problem_source} = ( $body_params->get('problem_source') || $query_params->get('problem_source'));

  my $source = body_parameters->get('source') || query_parameters->get('source');
  $source = decode_entities($source) if defined($source);

  return {
    displayMode => "MathJax",
    showHints => 0,
    showSolutions => 0,
    showAnswers => 0,
    problemSeed => $problem->{problem_seed},
    user => defined($user_id) ? $db->getUser($user_id) : fake_user(vars->{db}),
    set => $set,
    problem => $problem,
    source => $source
  };
}


###
#  This is a generic path that renders a problem if the source is passed to it.
#
#  Note: this is mainly for testing and for scripts to renderer a number of a problems in a directory.
#
###


any ['post', 'put'] => '/courses/:course_id/render' => sub {

  my $renderParams = parseParams(vars->{db},body_parameters,query_parameters);
  # debug dump $renderParams;
  my ($results,$pg,$form_data) = render(vars->{ce},vars->{db},$renderParams,\&debug);
  return $results;
};


1;

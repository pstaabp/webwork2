## This is a number of common subroutines needed when rendering


package Utils::RenderUtils;
use base qw(Exporter);

our @EXPORT    = ();
our @EXPORT_OK = qw/render recordResults/;

use Data::Dump qw/dump/;
use WeBWorK::Utils::Tasks qw/fake_user fake_set fake_problem/;
use Utils::Convert qw/convertBooleans convertObjectToHash/;
use WeBWorK::Utils qw/writeCourseLog writeLog/;
use WeBWorK::ContentGenerator::ProblemUtil::ProblemUtil qw/create_ans_str_from_responses/;

####
#
##  This is the general rendering function
#
#  input: $ce (course envinroment), $db (database variable) and $renderParams
#
##

sub render {

  my ($ce,$db,$renderParams,$debug) = @_;  # if debug is passed in, one can use the following:

	my $user = $renderParams->{user} || fake_user($db);

  my $form_data = {
  	displayMode => $renderParams->{displayMode} || $ce->{pg}{options}{displayMode},
  	outputformat => 'standard',
  	problemSeed => $renderParams->{problem}->{problem_seed} || 1,
		key => $renderParams->{key},
		sourceFilePath => $renderParams->{problem}->{source_file},
		templateName => "system"
  };

  for my $key (keys %{$renderParams->{answers}}){
		$form_data->{$key} = $renderParams->{answers}->{$key};
	}


  $form_data->{user} = $user->{user_id};
  $form_data->{effectiveUser} = $renderParams->{effectiveUser} || $form_data->{user};


	# &$debug($renderParams->{checkAnswers});
	if($renderParams->{checkAnswers}) {
		$form_data->{checkAnswers} = "Check Answers";
	}

	my $user          = $user;
	my $set           = $renderParams->{'this_set'} || fake_set($db);
	my $problem_seed  = $renderParams->{problem}->{'problem_seed'} || 1; #$r->param('problem_seed') || 0;
	my $showHints     = $renderParams->{show_hints} || 0;
	my $showSolutions = $renderParams->{show_solutions} || 0;
	my $problemNumber = $renderParams->{problem}->{'problem_number'} || 1;
  my $displayMode   = $renderParams->{displayMode}//
                       $ce->{pg}->{options}->{displayMode};

	my $translationOptions = {
		displayMode     => $displayMode,
		showHints       => $showHints,
		showSolutions   => $showSolutions,
		refreshMath2img => 1,
		processAnswers  => 1,
		QUIZ_PREFIX     => '',
		use_site_prefix => $ce->{server_root_url},
		permissionLevel => $user && $user->{user_id} && $db->getPermissionLevel($user->{user_id})
													? $db->getPermissionLevel($user->{user_id})->permission : -5
	};

	my $extras = {};   # Check what this is used for.

	# Create template of problem then add source text or a path to the source file
	local $ce->{pg}{specialPGEnvironmentVars}{problemPreamble} = {TeX=>'',HTML=>''};
	local $ce->{pg}{specialPGEnvironmentVars}{problemPostamble} = {TeX=>'',HTML=>''};
	my $problem = fake_problem($db, 'problem_seed'=>$problem_seed);
	$problem->{value} = $renderParams->{problemValue} || -1;

	$set->set_id('this set') unless $set->set_id();
	$problem->problem_id('1') unless $problem->problem_id();

	#&$debug(dump $renderParams->{problem});

  if (ref $renderParams->{source}) { #in this case the actual source is passed
	 	&$debug("here !!!!");
		$problem->source_file('this/is/a/fake/path');
		$translationOptions->{r_source} = $renderParams->{source};
	} else {
    $problem->{source_file} = $renderParams->{problem}->{source_file};
	}

my $pg = new WeBWorK::PG(
		$ce,
		$user,
		$key,
		$set,
		$problem,
		123, # PSVN (practically unused in PG)  only used as an identifier
		$form_data,
		$translationOptions,
		$extras,
	);
		# new version of output:
	my $warning_messages = '';  # for now -- set up warning trap later
	my ($internal_debug_messages, $pgwarning_messages, $pgdebug_messages);
  if (ref ($pg->{pgcore}) ) {
  	$internal_debug_messages   = $pg->{pgcore}->get_internal_debug_messages;
  	$pgwarning_messages        = $pg ->{pgcore}->get_warning_messages();
  	$pgdebug_messages          = $pg ->{pgcore}->get_debug_messages();
  } else {
  	$internal_debug_messages = ['Error in obtaining debug messages from PGcore'];
  }

	my $out =  {
		text 						=> $pg->{body_text},
		header_text 				=> $pg->{head_text},
		answers => {},
		errors         				=> $pg->{errors},
		WARNINGS	   				=> "WARNINGS\n".$warning_messages."\n<br/>More<br/>\n".$pg->{warnings},
		PG_ANSWERS_HASH             => $pg->{pgcore}->{PG_ANSWERS_HASH},
		problem_result 				=> $pg->{result},
		problem_state				=> $pg->{state},
		flags						=> $pg->{flags},
		warning_messages            => $pgwarning_messages,
		debug_messages              => $pgdebug_messages,
		internal_debug_messages     => $internal_debug_messages,
	};

	# unbless the answers:

	for my $ans (keys %{$pg->{answers}}){
		$out->{answers}->{$ans} = convertObjectToHash($pg->{answers}->{$ans});
	}

  # make the errors a bit easier to read.

	if($problem_hash->{errors}){
			my $text = qq|<div><em>An error occurred while processing this problem.</em>
									Click <a href="#" onclick='\$(this).parent().find(".bg-danger").removeClass("hidden"); return false'>here</a>
									to show details of the error. <p class='bg-danger hidden'>|;
			$text .= $problem_hash->{errors} . "</p></div>";

			$problem_hash->{text} = $text;
	}

  # the following contain subroutines, so remove them before serializing.
	delete $out->{PG_ANSWERS_HASH};
	delete $out->{flags}->{PROBLEM_GRADER_TO_USE};

	return ($out,$pg,$form_data);
}



## the following is mostly copied from webwork2/lib/ContentGenerator/Utils/ProblemUtils.pm

# process_and_log_answer subroutine.

# performs functions of processing and recording the answer given in the page.
# Also returns the appropriate scoreRecordedMessage.
# $ce - CourseEnvironment
# $db -- database object
# $pg -- a Local::PG object
# $set -- the UserSet
# $problem -- the UserProblem
# $form_data -- form data containing answers.

sub recordResults {

  my ($ce,$db,$pg,$set,$problem,$form_data,$debug) = @_;

  $problem->{formFields} = $form_data;

  my $scoreRecordedMessage = "";
  my $pureProblem  = $db->getUserProblem($problem->{user_id}, $problem->{set_id},$problem->{problem_id}); # checked
  my $isEssay = 0;

  # logging student answers

  my $answer_log = $ce->{courseFiles}->{logs}->{'answer_log'};
  if ( defined($answer_log ) and defined($pureProblem)) {
    # if ($submitAnswers && !$authz->hasPermissions($effectiveUser, "dont_log_past_answers")) {
    my $answerString = "";
    my $scores = "";
    my %answerHash = %{ $pg->{answers} };
    # FIXME  this is the line 552 error.  make sure original student ans is defined.
    # The fact that it is not defined is probably due to an error in some answer evaluator.
    # But I think it is useful to suppress this error message in the log.
    foreach (sort (keys %answerHash)) {
      my $orig_ans = $answerHash{$_}->{original_student_ans};
      my $student_ans = defined $orig_ans ? $orig_ans : '';
      $answerString  .= $student_ans."\t";
      # answer score *could* actually be a float, and this doesnt
      # allow for fractional answers :(
      $scores .= $answerHash{$_}->{score} >= 1 ? "1" : "0";
      $isEssay = 1 if ($answerHash{$_}->{type}//'') eq 'essay';

    }

    $answerString = '' unless defined($answerString); # insure string is defined.

    my $timestamp = time();
    writeCourseLog($ce, "answer_log",
      join("",
        '|', $problem->{user_id},
        '|', $problem->{set_id},
        '|', $problem->{problem_id},
        '|', $scores, "\t",
        $timestamp,"\t",
        $answerString,
      ),
    );

    #add to PastAnswer db
    my $pastAnswer = $db->newPastAnswer();
    $pastAnswer->course_id($ce->{courseName});
    $pastAnswer->user_id($problem->{user_id});
    $pastAnswer->set_id($problem->{set_id});
    $pastAnswer->problem_id($problem->{problem_id});
    $pastAnswer->timestamp($timestamp);
    $pastAnswer->scores($scores);
    $pastAnswer->answer_string($answerString);
    $pastAnswer->source_file($problem->{source_file});

    $db->addPastAnswer($pastAnswer);


    #}
  }


  # get a "pure" (unmerged) UserProblem to modify
  # this will be undefined if the problem has not been assigned to this user

  if (defined $pureProblem) {
    # store answers in DB for sticky answers
    my %answersToStore;

    ($answerString2,$encoded_answer_string, $scores2, $isEssay2) =create_ans_str_from_responses($problem, $pg);

    $problem->last_answer($encoded_answer_string);
    $pureProblem->last_answer($encoded_answer_string);
    $db->putUserProblem($pureProblem);
    #
    # my %answerHash = %{ $results->{answers} };
    # &$debug(dump \%answerHash);
    # $answersToStore{$_} = $renderParams->{formFields}->{$_}  #$answerHash{$_}->{original_student_ans} -- this may have been modified for fields with multiple values.  Don't use it!!
    # foreach (keys %answerHash);
    #
    # # There may be some more answers to store -- one which are auxiliary entries to a primary answer.  Evaluating
    # # matrices works in this way, only the first answer triggers an answer evaluator, the rest are just inputs
    # # however we need to store them.  Fortunately they are still in the input form.
    # my @extra_answer_names  = @{ $results->{flags}->{KEPT_EXTRA_ANSWERS}};
    # $answersToStore{$_} = $renderParams->{formFields}->{$_} foreach  (@extra_answer_names);
    #
    # # Now let's encode these answers to store them -- append the extra answers to the end of answer entry order
    # my @answer_order = (@{$results->{flags}->{ANSWER_ENTRY_ORDER}}, @extra_answer_names);
    # my $answerString = encodeAnswers(%answersToStore,@answer_order);
    #
    #
    # &$debug(\%answersToStore);
    # # store last answer to database
    # $problem->last_answer($answerString);
    # $pureProblem->last_answer($answerString);
    # $db->putUserProblem($pureProblem);

    # store state in DB if it makes sense
    if(1) { # if ($will{recordAnswers}) {
      $problem->status($pg->{state}->{recorded_score});
      $problem->sub_status($pg->{state}->{sub_recorded_score});
      $problem->attempted(1);
      $problem->num_correct($pg->{state}->{num_of_correct_ans});
      $problem->num_incorrect($pg->{state}->{num_of_incorrect_ans});
      $pureProblem->status($pg->{state}->{recorded_score});
      $pureProblem->sub_status($pg->{state}->{sub_recorded_score});
      $pureProblem->attempted(1);
      $pureProblem->num_correct($pg->{state}->{num_of_correct_ans});
      $pureProblem->num_incorrect($pg->{state}->{num_of_incorrect_ans});

      #add flags for an essay question.  If its an essay question and
      # we are submitting then there could be potential changes, and it should
      # be flaged as needing grading

      if ($isEssay && $pureProblem->{flags} !~ /needs_grading/) {
        $pureProblem->{flags} =~ s/graded,//;
        $pureProblem->{flags} .= "needs_grading,";
      }

      if ($db->putUserProblem($pureProblem)) {
        $scoreRecordedMessage = "Your score was recorded.";
      } else {
        $scoreRecordedMessage = "Your score was not recorded because there was a failure in storing the problem record to the database.";
      }
      # write to the transaction log, just to make sure
      writeLog($ce, "transaction",
      $problem->problem_id."\t".
      $problem->set_id."\t".
      $problem->user_id."\t".
      $problem->source_file."\t".
      $problem->value."\t".
      $problem->max_attempts."\t".
      $problem->problem_seed."\t".
      $pureProblem->status."\t".
      $pureProblem->attempted."\t".
      $pureProblem->last_answer."\t".
      $pureProblem->num_correct."\t".
      $pureProblem->num_incorrect
      );

    } else {
      if (before($renderParams->{set}->{open_date}) or after($renderParams->{set}->{due_date})) {
        $scoreRecordedMessage = "Your score was not recorded because this homework set is closed.";
      } else {
        $scoreRecordedMessage = "Your score was not recorded.";
      }
    }
  } else {
    $scoreRecordedMessage ="Your score was not recorded because this problem has not been assigned to you.";
  }
  # vars->{scoreRecordedMessage} = $scoreRecordedMessage;
  return $scoreRecordedMessage;
}

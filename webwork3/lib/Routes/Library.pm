### Library routes
##
#  These are the routes for all library functions in the RESTful webservice
#
##

package Routes::Library;

use Dancer2 appname => "Routes::Login";
use Dancer2::Plugin::Database;
use Dancer2::FileUtils qw/read_file_content path/;
use Data::Dump qw/dump dd/;
use Path::Class;
use File::Find::Rule;
# use File::Slurp;
use List::MoreUtils qw/uniq/;

use Utils::Convert qw/convertObjectToHash convertArrayOfObjectsToHash/;
use Utils::LibraryUtils qw/list_pg_files searchLibrary getProblemTags render render2/;
use Utils::ProblemSets qw/record_results/;
use HTML::Entities qw/decode_entities/;


use WeBWorK::DB::Utils qw(global2user);
use WeBWorK::Utils::Tasks qw(fake_user fake_set fake_problem);
use WeBWorK::PG::Local;
use WeBWorK::Constants;


get '/library/subjects' => sub {

  my $webwork_dir = config->{webwork_dir};
  my $file = "$webwork_dir/htdocs/DATA/library-subject-tree.json";
  my $json_text = do {
    open(my $json_fh, "<:encoding(UTF-8)", $file)  or send_error("The file $file does not exist.",404);
    local $/;
    <$json_fh>
  };
  return JSON->new->decode($json_text);

};

####
#
#  get all problems with subject *subject_id* and chapter *chapter_id* and section *section_id*
#
#   returns a array of problem paths? (global problem_id's)?
#
#  should pass in an limit on number of problems to return (100 for default?)
#
####


get qr{\/library\/subjects\/(.+)\/chapters\/(.+)\/sections\/(.+)\/problems} => sub {

  my ($subj,$chap,$sect) = splat;

  return searchLibrary(database,{subject=>$subj,chapter=>$chap,section=>$sect});
};


####
#
#  get all problems with subject *subject_id* and chapter *chapter_id*
#
#   returns a array of problem paths? (global problem_id's)?
#
#  should pass in an limit on number of problems to return (100 for default?)
#
####

get qr{\/library\/subjects\/(.+)\/chapters\/(.+)\/problems} => sub {

  my ($subj,$chap) = splat;
  return searchLibrary(database,{subject=>$subj,chapter=>$chap});
};


####
#
#  get all problems with subject *subject_id*
#
#   returns a array of problem paths? (global problem_id's)?
#
#  should pass in an limit on number of problems to return (100 for default?)
#
####


get qr{\/library\/subjects\/(.+)\/problems} => sub {

  my ($subj) = splat;

  return searchLibrary(database,{subject=>$subj});
};




#######
#
#  get '/library/directories'
#
#  return the directory tree of the library
#
####

get '/library/directories' => sub {

  my $webwork_dir = config->{webwork_dir};
  my $file = "$webwork_dir/htdocs/DATA/library-directory-tree.json";

  my $json_text = do {
    open(my $json_fh, "<:encoding(UTF-8)", $file)  or send_error("The file $file does not exist.",404);
    local $/;
    <$json_fh>
  };



  return decode_json $json_text;

};

#######
#
#  get '/library/directories'
#
#  return all the problems for a given directory in the library.
#
####

get '/library/directories/**' => sub {

  ## pstaab: trying to figure out the best way to pass the course_id.  It needs to be passed in as a parameter for this
  ##         to work.

  my ($dirs) = splat;
  my $path = vars->{ce}->{courseDirs}{templates} . "/" . join("/",@{$dirs});
  my $header = vars->{ce}->{courseDirs}{templates} . "/";
  my @files = File::Find::Rule->file()->name('*.pg')->in($path);
  my @allFiles =  map { $_ =~ s/$header//; {source_file=>$_}} @files;
  return \@allFiles;
};


#######
#
#  get '/library/local'
#
#  return all the problems in the course/templates directory
#
####

### this subroutine returns all of the pg files in the given directory and subdirectories
### in a recursive manner.

sub get_pg_files_in_dir {
  my $dir = shift;

  debug $dir;

  my @files = File::Find::Rule->file()->relative()->name("*.pg")->maxdepth(1)->in($dir);
  if(scalar(@files)==0){
    return {};
  }

  my @subdirs = File::Find::Rule->directory()
  ->maxdepth(1)
  ->mindepth(1)
  ->not_name("Pending")
  ->not_name("Library")
  ->in($dir);
  debug \@subdirs;

  my @other = ();

  for my $subdir (@subdirs){
    my $fred = get_pg_files_in_dir($subdir);
    if(keys(%$fred)){
      push(@other,$fred);
    }
  }
  debug \@other;
  if (scalar(@other)>0){
    return {base=>dir($dir)->basename, files=>\@files, subdirs=>\@other}
  } else {
    return {base => dir($dir)->basename, files=>\@files};
  }


}

get '/courses/:course_id/library/local' => sub {
  ## still need to search for directory with single files and others with ignoreDirectives.
  return get_pg_files_in_dir(dir(vars->{ce}->{courseDirs}{templates}));

};

#######
#
#  get '/library/pending'
#
#  return all the problems in the pending directory
#
####

get '/courses/:course_id/library/pending' => sub {

  ## still need to search for directory with single files and others with ignoreDirectives.

  setCourseEnvironment(params->{course_id});
  my $pendingDir = dir(vars->{ce}->{courseDirs}{templates},"Pending")->stringify;

  #    my @files = File::Find::Rule->extras({ follow => 1 })->file()->name("*.pg")->in($pendingDir);
  #
  #    my @parentDirectories = distinct (map { file($_)->stringify() } @files);
  #
  my @dirs = File::Find::Rule->extras({follow => 1})->relative->directory->exec( sub {
    my ( $shortname, $path, $fullname ) = @_;
    my @pgfiles = File::Find::Rule->extras({follow => 1})->file()->name("*.pg")->in($fullname);
    return scalar(@pgfiles)>0;} )->in($pendingDir);  ## return all directories containing pg files.

    my @info = ();

    for my $dir (@dirs){
      my $fullname = dir($pendingDir,$dir)->stringify;
      my @pgfiles = File::Find::Rule->extras({follow => 1})->file()->name("*.pg")->in($fullname);
      if(scalar(@pgfiles)>0){
        push(@info, {num_files => scalar(@pgfiles), path => $dir });
      }
    }

    return \@info;
  };

  ###
  #   WHAT IS THIS FOR?
  ###

  # get '/courses/:course_id/local/testing' => sub {
  #
  #   # setCourseEnvironment(params->{course_id});
  #   my $templateDir = vars->{ce}->{courseDirs}{templates} . "/Indiana";
  #
  #   my @dirs = File::Find::Rule->extras({follow => 1})->relative->directory->exec( sub {
  #       my ( $shortname, $path, $fullname ) = @_;
  #       my @pgfiles = File::Find::Rule->extras({follow => 1})->file()->name("*.pg")->in($fullname);
  #       return scalar(@pgfiles)>0;} )->in($templateDir);  ## return all directories containing pg files.
  #
  #   return \@dirs;
  #
  # };


  ######
  #
  #  get '/courses/:course_id/library/problems/local/**'
  #
  #  get local problems in the directory defined in **
  #
  #  if the terms in ** form a directory, then return an array of subdirectories/files
  #  if the terms in ** is a nonsense directory return an empty array
  #  if the terms in ** is the path to a local pg file (or other) return the file.
  #
  ####

  sub getFilesDirectories {
    my $path = shift;

    debug $path;
    my @subdirs = File::Find::Rule->directory
                                  ->relative
                                  ->maxdepth(1)
                                  ->in($path);
    debug \@subdirs;

    my @files = File::Find::Rule->file
                                  ->relative
                                  ->maxdepth(1)
                                  ->in($path);
    my @alldirs =  map { {name=>$_, type=>"dir"};} @subdirs;
    my @allfiles = map { {name=>$_, type=>"file"};} @files;
    push @alldirs, @allfiles;
    debug \@alldirs;
    return \@alldirs;
  }

  get '/courses/:course_id/local' => sub {

    debug 'in /courses/:course_id/local';

    return getFilesDirectories(vars->{ce}->{courseDirs}{templates});

  };

  get '/courses/:course_id/local/**' => sub {

    debug 'in /courses/:course_id/local/**';

    # my @dirs = File::Find::Rule->directory
    #                               ->relative
    #                               ->maxdepth(1)
    #                               ->in('/opt/webwork/courses/test/templates/macros');
    #
    #                               debug \@dirs;

    my ($dirs) = splat;
    my @dirs = @{$dirs};
    my $path = path(vars->{ce}->{courseDirs}{templates},@dirs);

    debug $path;

    return getFilesDirectories($path);
  };

  #######
  #
  #  get '/courses/:course_id/library/setDefinition'
  #
  #  return all the problems in any setDefinition file in the local library.
  #
  ####

  get '/courses/:course_id/library/setDefinition' => sub {

    ## still need to search for directory with single files and others with ignoreDirectives.

    my $path = dir(vars->{ce}->{courseDirs}{templates});
    my $probLibs = vars->{ce}->{courseFiles}{problibs};

    my $libPath = $path . "/" . "Library";  # hack to get this to work.  Need to make this more robust.
    #my $parentPath =  $path->parent;

    my @setDefnFiles = ();

    $path->recurse( preorder=>1,callback=>sub {
      my ($dir) = @_;
      if ($dir =~ /^$libPath/){
        return Path::Class::Entity::PRUNE(); # don't follow into the Library directory
      } else {
        my $relDir = $dir;
        $relDir =~ s/^$path\/(.*)/$1/;
        if($dir =~ m|/set[^/]*\.def$|) {
          push(@setDefnFiles,$relDir);
        }
      }
    });

    ## read the set definition files for pg files

    my @pg_files = ();

    for my $filePath (@setDefnFiles){
      my ($line, $got_to_pgs, $name, @rest) = ("", 0, "");
      if ( open (SETFILENAME, "$path/$filePath") )    {
        while($line = <SETFILENAME>) {
          chomp($line);
          $line =~ s|(#.*)||; # don't read past comments
          if($got_to_pgs) {
            unless ($line =~ /\S/) {next;} # skip blank lines
            ($name,@rest) = split (/\s*,\s*/,$line);
            $name =~ s/\s*//g;
            push @pg_files, $name;
          } else {
            $got_to_pgs = 1 if ($line =~ /problemList\s*=/);
          }
        }
      } else {
        debug("oops");
      }
    }

    my @allFiles =  map { {source_file=>$_} } @pg_files;
    return \@allFiles;

  };


  ####
  #
  #   get '/Library/textbooks'
  #
  #   returns a JSON file that contains all of the textbook information
  #
  ####

  get '/library/textbooks' => sub {

    debug 'in /library/textbooks';

    my $webwork_dir = config->{webwork_dir};
    my $file = "$webwork_dir/htdocs/DATA/textbook-tree.json";

    debug $file;

    my $json_text = do {
      open(my $json_fh, "<:encoding(UTF-8)", $file)  or send_error("The file $file does not exist.",404);
      local $/;
      <$json_fh>
    };

    return JSON->new->decode($json_text);

  };

  get '/library/textbooks/sections/:section_id/problems' => sub {
    return searchLibrary(vars->{db},{section_id => route_parameters->{section_id}});
  };

  ####
  #
  #  get '/Library/textbooks/:textbook_id/chapters/:chapter_id/sections/:section_id/problems'
  #
  #  returns all problems in the given textbook/chapter/section
  #
  ##

  get '/library/textbooks/chapters/:chapter_id/problems' => sub {

    return searchLibrary(database,{
      chapter_id=>route_parameters->{chapter_id}
    },\&debug);

  };


  ####
  #
  #  get '/Library/textbooks/:textbook_id/problems'
  #
  #  returns all problems in the given textbook
  #
  ##

  get '/library/textbooks/:textbook_id/problems' => sub {

    return searchLibrary(database,{textbook_id=>route_parameters->{textbook_id}});

  };

  ####
  #
  #  The following are used when getting problems from textbooks (from the Library Browser)
  #
  ####

  get '/textbooks/author/:author_name/title/:title/problems' => sub {

    return searchLibrary(database,{textbook_author=>params->{author_name},textbook_title=>params->{title}});

  };

  get '/textbooks/author/:author_name/title/:title/chapter/:chapter/problems' => sub {

    return searchLibrary(database,{textbook_author=>params->{author_name},textbook_title=>params->{title},
    textbook_chapter=>params->{chapter}});

  };

  get '/textbooks/author/:author_name/title/:title/chapter/:chapter/section/:section/problems' => sub {

    return searchLibrary(database,{textbook_author=>params->{author_name},textbook_title=>params->{title},
    textbook_chapter=>params->{chapter},textbook_section=>params->{section}});

  };




  ####
  #
  ##  get '/library/problems'
  #
  #  search the library.  Any of the problem metadata can be called as a parameter to this
  #
  #  return an array of problems that fit the criteria
  #
  # ###

  get '/library/problems' => sub {

    my $searchParams = {};
    for my $key (qw/keyword level author institution subject chapter section section_id textbook_id chapter_id/){
      $searchParams->{$key} = params->{$key} if defined(params->{$key});
    }

    return searchLibrary(database,$searchParams);

  };

  ###
  #
  #  get '/library/courses/:course_id/problems/:problem_id/tags'
  #
  #  This returns all of the tags from the DB for a problem.  Note: the course_id must be passed as a parameter
  #
  ##

  get '/library/courses/:course_id/problems/:problem_id/tags' => sub {
    my $pgfile = path(vars->{ce}->{courseDirs}->{templates}, params->{source_file});
    return convertObjectToHash(getProblemTags($pgfile));
  };


  ###
  #
  #  This returns the taxonomy file for tagging in the library
  #
  ###

  get '/library/courses/:course_id/taxonomy' => sub {
    my $file = path(vars->{ce}->{webwork_htdocs_dir},"DATA","tagging-taxonomy.json");

    my $json_text = do {
      open(my $json_fh, "<:encoding(UTF-8)", $file)  or send_error("The file $file does not exist.",404);
      local $/;
      <$json_fh>
    };

    return from_json($json_text);
  };

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

  any ['get', 'post'] => '/renderer/courses/:course_id/problems/:problem_id' => sub {

    my $renderParams = {
      displayMode => query_parameters->get('displayMode') || body_parameters->get("displayMode")
      || vars->{ce}->{pg}{options}{displayMode},
      showHints => (query_parameters->get('showHints') || body_parameters->get("showHints") || "false") eq 'true'? 1:0,
      showSolutions => (query_parameters->get('showSolutions') || body_parameters->get("showSolutions") || "false") eq 'true'? 1:0,
      showAnswers => 0,
      problem => {
        problem_seed => query_parameters->get('problem_seed') || body_parameters->get("problem_seed") || 1,
        problem_id => query_parameters->get('problem_id') || body_parameters->get("problem_id") || 1,
      }
    };



    # check to see if the problem_path is defined

    if (defined(params->{pgSource})){
      $renderParams->{problem}->{pgSource} = params->{pgSource};
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

  my $rp = render(vars->{ce},vars->{db},$renderParams,\&debug);
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

any ['get', 'post'] => '/renderer/courses/:course_id/users/:user_id/sets/:set_id/problems/:problem_id' => sub {

  send_error("The set " . params->{set_id} . " does not exist.",404) unless vars->{db}->existsGlobalSet(params->{set_id});

  send_error("The problem with id " . params->{problem_id} . " does not exist in set " . params->{set_id},404)
  unless vars->{db}->existsGlobalProblem(params->{set_id},params->{problem_id});

  send_error("The user " . params->{user_id} . " is not assigned to the set " . params->{set_id} . ".")
  unless vars->{db}->existsUserProblem(params->{user_id},params->{set_id},params->{problem_id});


  my $renderParams = {};

  $renderParams->{displayMode} = query_parameters->get('displayMode') || body_parameters->get('displayMode')
  || vars->{ce}->{pg}{options}{displayMode};

  ### The user is not a professor

  if(session->{permission} < 10){  ### check that the user belongs to the course and set.

  send_error("You are a student and must be assigned to the set " . params->{set_id},404)
  unless (vars->{db}->existsUser(param('user_id')) &&  vars->{db}->existsUserSet(param('user_id'), params->{set_id}));

  # these should vary depending on number of attempts or due_date or ???
  $renderParams->{showHints} = 0;
  $renderParams->{showSolutions} = 0;
  $renderParams->{showAnswers} = 0;

} else {
  $renderParams->{showHints} = defined(param('show_hints'))? int(param('show_hints')) : 0;
  $renderParams->{showSolutions} = defined(param('show_solutions'))? int(param('show_solutions')) : 0;
  $renderParams->{showAnswers} = defined(param('show_answers'))? int(param('show_answers')) : 0;
}

$renderParams->{problem} = vars->{db}->getMergedProblem(params->{user_id},params->{set_id},params->{problem_id});
$renderParams->{user} = vars->{db}->getUser(params->{user_id});
$renderParams->{set} = vars->{db}->getMergedSet(params->{user_id},params->{set_id});

my $results = render(vars->{ce},vars->{db},$renderParams);

## if it was a post request, then we record the the results in the log file and in the past_answer database
if(request->is_post){
  $results->{recorded_msg} = record_results($renderParams,$results);
}

return $results;


};




####
#
#  get put the PG source of a problem in the library.
#
####

get '/courses/:course_id/library/fullproblem' => sub {

  my $fullpath = path(vars->{ce}->{courseDirs}{templates} , query_parameters->{source_file});
  my $problemSource = read_file_content($fullpath);
  send_error("The problem with path " + params->{path} + " does not exist.",403) unless defined($problemSource);
  return {problem_source=>$problemSource};
};

### not sure what this is for.

put '/library/fullproblem' => sub {
  Routes::Login::setCourseEnvironment(params->{course_id});  # currently need to set the course to use vars->{ce}

  my $fullpath = path(vars->{ce}->{courseDirs}{templates} , params->{path});

  # test to make sure that it is not writing to the OPL

  # test permissions

  my $test = write_file($fullpath,params->{problem_source});

  return {};
};

###
#  This is a generic path that renders a problem if the source is passed to it.
#
#  Note: this is mainly for testing and for scripts to renderer a number of a problems in a directory.
#
###


post '/renderer' => sub {

  my $source = decode_entities body_parameters->{source} if defined(body_parameters->{source});

  my $problem = fake_problem(vars->{db});
  $problem->{problem_seed} = params->{seed} || 1;
  $problem->{problem_id} = 1;
  $problem->{source_file} = params->{source_file} || "this_is_a_fake_path";

  my $renderParams = {
    displayMode=>"MathJax",
    showHints=>0,
    showSolutions=>0,
    showAnswers=>0,
    problemSeed=>1,
    user => fake_user(vars->{db}),
    set => fake_set(vars->{db}),
    problem => $problem,
    source => defined($source)?\$source: undef
  };

  return render(vars->{ce},vars->{db},$renderParams,\&debug);
};

####
#
# get an array of directories in the templates Directory
#
###

sub find_dirs {
  my $dir         = shift;
  my @dirs = ();
  my @subdirs = ();

  opendir my $dh, $dir or die qq{Unable to open directory "$dir": $!};
  while ( my $node = readdir $dh ) {
    next if $node eq '.' or $node eq '..' or $node eq 'Library' or $node eq 'tmpEdit';
    my $abs_path = path($dir,$node);
    if (-d $abs_path) {
      @subdirs = find_dirs($abs_path);
      push(@dirs,$abs_path);
      push(@dirs,@subdirs) if scalar(@subdirs) >0;
    }
  }
  closedir $dh;

  return @dirs;
}

###
#
# return an array of directories in the local templates directory
#
###

get '/courses/:course_id/pgproblems/directories' => sub {

  my @dirs = find_dirs(vars->{ce}->{courseDirs}{templates});
  my @rel_dirs = map { $_ =~ /.*\/templates\/(.*)/;} @dirs;  # make these relative paths.

  return {dirs => \@rel_dirs};
};

###
#
# return an array of files in a given local templates directory
#
###

get '/courses/:course_id/pgproblems/files' => sub {
  my $dir = query_parameters->get('directory');

  my $abs_dir = path(vars->{ce}->{courseDirs}{templates},$dir);
  $abs_dir =~ s/\[TOP\]//;

  send_error("The directory $dir does not exist",404) unless -d $abs_dir;

  opendir my $dh, $abs_dir or die qq{Unable to open directory "$abs_dir": $!};
  my @files = grep { my $ab_path = path($abs_dir,$_); -f $ab_path && $ab_path =~ m/\.pg$/} readdir($dh);
  closedir $dh;

  return {files => \@files};
};

1;

### Library routes
##
#  These are the routes for all library functions in the RESTful webservice
#
#  This includes pulling information from the OPL database.
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
use Utils::LibraryUtils qw/list_pg_files searchLibrary get_pg_files_in_dir getProblemTags/;
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

    # debug $path;
    my @subdirs = File::Find::Rule->directory
                                  ->relative
                                  ->maxdepth(1)
                                  ->in($path);
    # debug \@subdirs;

    my @files = File::Find::Rule->file
                                  ->relative
                                  ->maxdepth(1)
                                  ->in($path);
    my @alldirs =  map { {name=>$_, type=>"dir"};} @subdirs;
    my @allfiles = map { {name=>$_, type=>"file"};} @files;
    push @alldirs, @allfiles;
    # debug \@alldirs;
    return \@alldirs;
  }

  get '/courses/:course_id/local' => sub {

    # debug 'in /courses/:course_id/local';

    return getFilesDirectories(vars->{ce}->{courseDirs}{templates});

  };

  get '/courses/:course_id/local/**' => sub {

    # debug 'in /courses/:course_id/local/**';

    # my @dirs = File::Find::Rule->directory
    #                               ->relative
    #                               ->maxdepth(1)
    #                               ->in('/opt/webwork/courses/test/templates/macros');
    #
    #                               # debug \@dirs;

    my ($dirs) = splat;
    my @dirs = @{$dirs};
    my $path = path(vars->{ce}->{courseDirs}{templates},@dirs);

    # debug $path;

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
        # debug("oops");
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

    # debug 'in /library/textbooks';

    my $webwork_dir = config->{webwork_dir};
    my $file = "$webwork_dir/htdocs/DATA/textbook-tree.json";

    # debug $file;

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
    },\& debug);

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

  get '/library/courses/:course_id/problems/tags/**' => sub {
    # my $pgfile_id = route_parameters->get('problem_id');
    # debug $pgfile_id;
    my ($problem_path) = splat;
    # debug dump $problem_path;
    # debug join("/",@$problem_path);
    my $pgfile = path(vars->{ce}->{courseDirs}->{templates}, @$problem_path);
    debug $pgfile;
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

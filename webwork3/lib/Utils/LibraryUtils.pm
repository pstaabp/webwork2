## This is a number of common subroutines needed when processing the routes.


package Utils::LibraryUtils;
use base qw(Exporter);
use Path::Class qw/file dir/;

use List::MoreUtils qw/distinct first_index indexes/;
use WeBWorK::Utils::Tags;
use WeBWorK::Utils qw/readDirectory/;
use Utils::Convert qw/convertBooleans convertObjectToHash/;
use WeBWorK3::PG::Local;
use WeBWorK::Utils::Tasks qw(fake_user fake_set fake_problem);
use Data::Dump qw/dd dump/;


our @EXPORT    = ();
our @EXPORT_OK = qw/list_pg_files searchLibrary getProblemTags render get_pg_files_in_dir
											find_dirs/;
our @answerFields = qw/preview_latex_string done original_student_ans preview_text_string ans_message
						student_ans error_flag score correct_ans ans_label error_message _filter_name type ans_name/;

my %ignoredir = (
	'.' => 1, '..' => 1, 'CVS' => 1, 'tmpEdit' => 1,
	'headers' => 1, 'macros' => 1, 'email' => 1, '.svn' => 1, 'achievements' => 1,
);

sub getFilePaths {
	my $allfiles = shift;

	my @problems = ();

	## this seems like a very inefficient way to look up the path header.  Can we build a hash to do this?

	for my $file (@$allfiles){
		my $path_header = database->quick_select('OPL_path',{path_id=>$file->{path_id}});
		push(@problems,{source_file=>"Library/" . $path_header->{path} . "/" . $file->{filename}});
	}

	return \@problems;
}




## this returns all problems in the library that matches the given subject

sub get_subject_problems {
	my ($db,$subject) = @_;

	my $queryString = "select CONCAT(path.path,'/',pg.filename) AS fullpath,pg.morelt_id "
					. "from OPL_DBsubject AS sub "
					. "JOIN OPL_DBchapter AS ch ON sub.DBsubject_id = ch.DBsubject_id "
					. "JOIN OPL_DBsection AS sect ON sect.DBchapter_id = ch.DBchapter_id "
					. "JOIN OPL_pgfile AS pg ON sect.DBsection_id = pg.DBsection_id "
					. "JOIN OPL_path AS path ON pg.path_id = path.path_id "
					. "WHERE sub.name='" . $subject . "';";

	my $results = $db->selectall_arrayref($queryString);

	my @problems=  map {{source_file=>"Library/" .$_->[0], morelt=>$_[1]} } @{$results};

	return \@problems;


}

## this returns all problems in the library that matches the given subject/chapter


sub get_chapter_problems {
	my ($db,$subject,$chapter) = @_;

	my $queryString = "select CONCAT(path.path,'/',pg.filename) AS fullpath,pg.morelt_id "
					. "from OPL_DBsection AS sect "
					. "JOIN OPL_DBsubject AS sub "
					. "JOIN OPL_DBchapter AS ch ON ch.DBchapter_id = sect.DBchapter_id "
					. "JOIN OPL_pgfile AS pg ON sect.DBsection_id = pg.DBsection_id "
					. "JOIN OPL_path AS path ON pg.path_id = path.path_id "
					. "WHERE ch.name='" . $chapter . "' and sub.name='" . $subject . "';";

	my $results = $db->selectall_arrayref($queryString);

	my @problems=  map {{source_file=>"Library/" .$_->[0], morelt=>$_[1]} } @{$results};

	return \@problems;

}



## this returns all problems in the library that matches the given subject/chapter/section


sub get_section_problems {
	my ($db,$subject,$chapter,$section) = @_;

	my $queryString = "select CONCAT(path.path,'/',pg.filename) AS fullpath,pg.morelt_id "
					. "from OPL_DBsection AS sect "
					. "JOIN OPL_DBchapter AS ch JOIN OPL_DBsubject AS sub "
					. "JOIN OPL_pgfile AS pg ON sect.DBsection_id = pg.DBsection_id "
					. "JOIN OPL_path AS path ON pg.path_id = path.path_id "
					. "WHERE sect.name='" . $section . "' AND ch.name='" . $chapter . "'"
					. "and sub.name='" . $subject . "';";

	my $results = $db->selectall_arrayref($queryString);

	my @problems=  map {{source_file=>"Library/" .$_->[0], morelt=>$_[1]} } @{$results};

	return \@problems;
}

## search the library
#
#  The search criteria is passed in as a hash with the following possible keys:
#
#		keywords
#		subject
#		chapter
#		section
#		textbook
#		textbook_chapter
#		textbook_section
#		level
#
#		(currently not all of these are implemented)
#
###

sub searchLibrary {
	my ($db,$p,$debug) = @_;  # pass in the debug function as \&debug

	dd 'in searchLibrary';

  # if no params are passed return an empty array.
  if(!defined($p)){
      return [];
  }

	# escape the ' in any parameter.

	for my $key (keys %{$p}){
		my $val = $p->{$key};
		$val =~ s/\'/\\'/g;
		$param->{$key} = $val;
	}

	my $selectClause = "SELECT CONCAT(path.path,'/',pg.filename),pg.pgfile_id,pg.morelt_id "
					. "FROM OPL_path AS path "
					. "JOIN OPL_pgfile AS pg ON path.path_id=pg.path_id ";

	my $groupClause = "";
	my $whereClause = "WHERE ";

	## keyword search.  Note: only a single keyword works right now.
	if(defined($param->{keyword})){
		my $kw = $param->{keyword};
		$kw =~ s/\s//g; #remove all spaces

		$selectClause .= "LEFT JOIN OPL_pgfile_keyword AS pgkey ON pgkey.pgfile_id=pg.pgfile_id "
						. "LEFT JOIN OPL_keyword AS kw ON kw.keyword_id=pgkey.keyword_id ";
		$whereClause .= "kw.keyword LIKE '" . $kw . "' ";
		$groupClause = "GROUP BY pg.pgfile_id";

	}
	## level search as a range of numbers like 2-4
	if (defined($param->{level}) && $param->{level} =~ /^[1-6]-[1-6]$/) {
		if($param->{level} =~ /^(\d)-(\d)$/){
			$whereClause .="AND " if(length($whereClause)>6);
			$whereClause .= "pg.level BETWEEN $1 AND $2 ";
		}
	}
	## level search as a set of numbers like 1,3,5 (works as a single number too)
	if (defined($param->{level}) && $param->{level} =~ /^[1-6](,[1-6])*$/) {
		$whereClause .="AND " if(length($whereClause)>6);
		$whereClause .="pg.level IN (" . $param->{level} . ") ";
	}
	## problem author search    note: only searches by last name right now
	if (defined($param->{author})){
		$selectClause .= "JOIN OPL_author AS author ON author.author_id = pg.author_id ";
		$whereClause .="AND " if(length($whereClause)>6);
		$whereClause .="(author.lastname LIKE '" . $param->{author} . "' OR author.firstname LIKE '" . $param->{author} . "') ";
	}
	## institution search
	## level search as a set of numbers like 1,3,5 (works as a single number too)
	if (defined($param->{institution})) {
		$whereClause .="AND " if(length($whereClause)>6);
		$whereClause .="pg.institution LIKE '" . $param->{institution} . "'  ";
	}
	## DBsubject/DBchapter/DBsection search
	if(defined($param->{subject}) || defined($param->{chapter}) || defined($param->{section})){
		$selectClause .= "JOIN OPL_DBsection AS DBsect ON DBsect.DBsection_id = pg.DBsection_id "
						. "JOIN OPL_DBchapter AS DBch ON DBsect.DBchapter_id = DBch.DBchapter_id "
						. "JOIN OPL_DBsubject AS DBsubj ON DBsubj.DBsubject_id = DBch.DBsubject_id ";
	}
	##DBsubject searach
	if(defined($param->{subject})){
		$whereClause .="AND " if(length($whereClause)>6);
		$whereClause .="DBsubj.name LIKE '" . $param->{subject} . "'  ";
	}
	## DBchapter search
	if(defined($param->{chapter})){
		$whereClause .="AND " if(length($whereClause)>6);
		$whereClause .="DBch.name LIKE '" . $param->{chapter} . "'  ";
	}
	## DBsection search
	if(defined($param->{section})){
		$whereClause .="AND " if(length($whereClause)>6);
		$whereClause .="DBsect.name LIKE '" . $param->{section} . "'  ";
	}
	##Textbook search
	if(defined($param->{section_id})||defined($param->{textbook_id})||defined($param->{chapter_id}) || defined($param->{textbook_title}) || defined($param->{textbook_author})){
		$selectClause .= "LEFT JOIN OPL_pgfile_problem AS pgprob ON pgprob.pgfile_id=pg.pgfile_id "
				. "LEFT JOIN OPL_problem AS prob ON pgprob.problem_id=prob.problem_id "
				. "LEFT JOIN OPL_section AS sect ON prob.section_id=sect.section_id "
				. "LEFT JOIN OPL_chapter AS ch ON ch.chapter_id = sect.chapter_id "
				. "LEFT JOIN OPL_textbook AS textbook ON textbook.textbook_id = ch.textbook_id ";
	}
	##Textbook textbook_id search
	if(defined($param->{textbook_id})){
		$whereClause .="AND " if(length($whereClause)>6);
		$whereClause .="textbook.textbook_id='".$param->{textbook_id} ."' ";
	}
	##Textbook chapter_id search
	if(defined($param->{chapter_id})){
		$whereClause .="AND " if(length($whereClause)>6);
		$whereClause .="ch.chapter_id='".$param->{chapter_id} ."' ";
	}
	##Textbook section_id search
	if(defined($param->{section_id})){
		$whereClause .="AND " if(length($whereClause)>6);
		$whereClause .="sect.section_id='".$param->{section_id} ."' ";
	}

	##Textbook author search
	if(defined($param->{textbook_author})){
		$whereClause .="AND " if(length($whereClause)>6);
		$whereClause .="textbook.author='".$param->{textbook_author}."' ";
	}
	##Textbook title search
	if(defined($param->{textbook_title})){
		$whereClause .="AND " if(length($whereClause)>6);
		$whereClause .="textbook.title='".$param->{textbook_title}."' ";
	}

	##Textbook chapter search
	if(defined($param->{textbook_chapter})){
		$whereClause .="AND " if(length($whereClause)>6);
		$whereClause .="ch.name='".$param->{textbook_chapter}."' ";
	}

	##Textbook section search
	if(defined($param->{textbook_section})){
		$whereClause .="AND " if(length($whereClause)>6);
		$whereClause .="sect.name='".$param->{textbook_section}."' ";
	}

	if(defined &$debug){
    &$debug($selectClause . $whereClause . $groupClause . ";");
	}

  my $results = $db->selectall_arrayref($selectClause . $whereClause . $groupClause . ";");

  my @problems = map { {source_file => "Library/" . $_->[0], pgfile_id=>$_->[1], morelt_id => $_->[2]} } @{$results};
  my @lib_bools = qw/mlt_leader/;

  my $sorted_probs = sortByMLT($db,\@problems);
  for my $prob (@$sorted_probs){
      convertBooleans($prob, \@lib_bools);
  }

  return $sorted_probs;
}

###
#
# This routine takes an array of problems in the array ref $problems, sorts them to put problem
# with common mlt tags and returns the result.
#
###

sub sortByMLT {
    my ($db,$problems) = @_;

    my @mlts = grep {$_ > 0} distinct map {$_->{morelt_id} } @$problems;
    my $leaders = {};
    for my $mlt_id (@mlts){
        my @results = $db->selectrow_array("select * from OPL_morelt where morelt_id='"
                                                . $mlt_id . "';");
        $leaders->{$mlt_id} = $results[3];
    }

    my @sorted_problems = ();
    while(scalar(@$problems)>0){
        if (! defined($leaders->{$problems->[0]->{morelt_id}})
                || $problems->[0]->{morelt_id} == 0) {
            my $prob = shift @$problems;
            push(@sorted_problems,$prob);
        } else {
            # find the more_lt leader for the given morelt_id
            my $i = first_index {$_->{pgfile_id} == $leaders->{$problems->[0]->{morelt_id}}} @$problems;
            my $prob = splice(@$problems,$i,1);
            $prob->{mlt_leader} = 1;

            push(@sorted_problems,$prob);

            # find the remainder of the related morelt problems and push them on the
            # $problems array.
            my @inds = indexes { $_->{morelt_id} == $prob->{morelt_id} } @$problems;
            for my $ind (reverse @inds){
                my $p = splice(@$problems,$ind,1);
                $p->{mlt_leader} = "";
                push(@sorted_problems,$p);
            }
        }
    }
    return \@sorted_problems;
}

sub getProblemTags {
    my $file_path = shift;
    my $tagObj = WeBWorK::Utils::Tags->new($file_path);

    return $tagObj;

}


###
#
#  Older version of the subroutine above.
#
##

sub getProblemTagsFromDB {
	my $fileID = shift;
	if ($fileID < 0){  ## then the pgfile_id is not defined.  Use the source_file to look up the information.

		my $file = file(params->{source_file});
		my @fileDirs = $file->parent->components;
		@fileDirs = @fileDirs[1..$#fileDirs];

		my $path = dir(@fileDirs);
		my $filename = $file->basename;
		my $queryString = "SELECT pg.pgfile_id FROM OPL_path AS path "
							." JOIN OPL_pgfile AS pg ON path.path_id = pg.path_id "
							." WHERE path.path='" . $path->stringify .  "' and pg.filename='" . $filename . "';";
       my $pathID = database->selectrow_arrayref($queryString);
       $fileID = $pathID->[0] || "";

	}

	my	$selectClause = "SELECT CONCAT(author.firstname,' ',author.lastname), group_concat(DISTINCT kw.keyword), "
						. "pg.level, pg.institution, DBsubj.name, DBch.name, DBsect.name, mlt.name, "
						. "textbook.title,ch.name,sect.name "
						. "FROM OPL_path AS path JOIN OPL_pgfile AS pg ON path.path_id=pg.path_id "
						. "LEFT JOIN OPL_pgfile_keyword AS pgkey ON pgkey.pgfile_id=pg.pgfile_id "
						. "LEFT JOIN OPL_keyword AS kw ON kw.keyword_id=pgkey.keyword_id "
						. "LEFT JOIN OPL_author AS author ON author.author_id = pg.author_id "
						. "LEFT JOIN OPL_DBsection AS DBsect ON DBsect.DBsection_id = pg.DBsection_id "
						. "LEFT JOIN OPL_DBchapter AS DBch ON DBsect.DBchapter_id = DBch.DBchapter_id "
						. "LEFT JOIN OPL_DBsubject AS DBsubj ON DBsubj.DBsubject_id = DBch.DBsubject_id "
						. "LEFT JOIN OPL_morelt AS mlt ON mlt.morelt_id = pg.morelt_id "
						. "LEFT JOIN OPL_pgfile_problem AS pgprob ON pgprob.pgfile_id=pg.pgfile_id "
						. "LEFT JOIN OPL_problem AS prob ON pgprob.problem_id=prob.problem_id "
						. "LEFT JOIN OPL_section AS sect ON prob.section_id=sect.section_id "
						. "LEFT JOIN OPL_chapter AS ch ON ch.chapter_id = sect.chapter_id "
						. "LEFT JOIN OPL_textbook AS textbook ON textbook.textbook_id = ch.textbook_id ";
	my $whereClause ="WHERE pg.pgfile_id='". $fileID ."'";

	#debug $selectClause. $whereClause;

	my $results = database->selectrow_arrayref($selectClause . $whereClause . ";");

	return { author => $results->[0], keyword => $results->[1] , level=>$results->[2], institution=>$results->[3],
				  subject=> $results->[4], chapter=>$results->[5], section=>$results->[6], morelt=>$results->[7],
				  textbook_title=> $results->[8], textbook_chapter=>$results->[9], textbook_section=>$results->[10]};

}


### this subroutine returns all of the pg files in the given directory and subdirectories
### in a recursive manner.

sub get_pg_files_in_dir {
  my $dir = shift;

  # debug $dir;

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
  # debug \@subdirs;

  my @other = ();

  for my $subdir (@subdirs){
    my $fred = get_pg_files_in_dir($subdir);
    if(keys(%$fred)){
      push(@other,$fred);
    }
  }
  # debug \@other;
  if (scalar(@other)>0){
    return {base=>dir($dir)->basename, files=>\@files, subdirs=>\@other}
  } else {
    return {base => dir($dir)->basename, files=>\@files};
  }


}


## This is for searching the disk for directories containing pg files.
## to make the recursion work, this returns an array where the first
## item is the number of pg files in the directory.  The second is a
## list of directories which contain pg files.
##
## If a directory contains only one pg file and the directory name
## is the same as the file name, then the directory is considered
## to be part of the parent directory (it is probably in a separate
## directory only because it has auxiliary files that want to be
## kept together with the pg file).
##
## If a directory has a file named "=library-ignore", it is never
## included in the directory menu.  If a directory contains a file
## called "=library-combine-up", then its pg are included with those
## in the parent directory (and the directory does not appear in the
## menu).  If it has a file called "=library-no-combine" then it is
## always listed as a separate directory even if it contains only one
## pg file.

# sub get_library_sets {

# 	my ($top,$base,$dir,$probLib) = @_;
# 	# ignore directories that give us an error
# 	my @lis = eval { readDirectory($dir) };
# 	if ($@) {
# 		warn $@;
# 		return (0);
# 	}
# 	return (0) if grep /^=library-ignore$/, @lis;

# 	my @pgfiles = grep { m/\.pg$/ and (not m/(Header|-text)(File)?\.pg$/) and -f "$dir/$_"} @lis;
# 	my $pgcount = scalar(@pgfiles);
# 	my $pgname = $dir; $pgname =~ s!.*/!!; $pgname .= '.pg';
# 	my $combineUp = ($pgcount == 1 && $pgname eq $pgfiles[0] && !(grep /^=library-no-combine$/, @lis));

# 	my @pgdirs;
# 	my @dirs = grep {!$ignoredir{$_} and -d "$dir/$_"} @lis;
# 	if ($top == 1) {@dirs = grep {!$problib{$_}} @dirs}
# 	# Never include Library at the top level
# 	if ($top == 1) {@dirs = grep {$_ ne 'Library'} @dirs}
# 	foreach my $subdir (@dirs) {
# 		my @results = get_library_sets(0, "$dir/$subdir");
# 		$pgcount += shift @results; push(@pgdirs,@results);
# 	}

# 	return ($pgcount, @pgdirs) if $top || $combineUp || grep /^=library-combine-up$/, @lis;
# 	return (0,@pgdirs,$dir);
# }


# sub get_library_pgs {

# 	#print join(",",@_) . "\n";

# 	my ($top,$base,$dir,$probLib) = @_;

# 	my @lis = readDirectory("$base/$dir");
# 	return () if grep /^=library-ignore$/, @lis;
# 	return () if !$top && grep /^=library-no-combine$/, @lis;

# 	my @pgs = grep { m/\.pg$/ and (not m/(Header|-text)\.pg$/) and -f "$base/$dir/$_"} @lis;
# 	my $others = scalar(grep { (!m/\.pg$/ || m/(Header|-text)\.pg$/) &&
# 	                            !m/(\.(tmp|bak)|~)$/ && -f "$base/$dir/$_" } @lis);

# 	my @dirs = grep {!$ignoredir{$_} and -d "$base/$dir/$_"} @lis;
# 	if ($top == 1) {@dirs = grep {!$problib->{$_}} @dirs}

# 	foreach my $subdir (@dirs) {push(@pgs, get_library_pgs(0,"$base/$dir",$subdir,$probLib))}

# 	return () unless $top || (scalar(@pgs) == 1 && $others) || grep /^=library-combine-up$/, @lis;
# 	return (map {"$dir/$_"} @pgs);
# }

sub list_pg_files {
	my ($templates,$dir,$probLib) = @_;
	#print "templates: $templates    dir: $dir   problib: $probLib \n";
	my $top = ($dir eq '.')? 1 : 2;
	my @pgs = get_library_pgs($top,$templates,$dir,$probLib);
	return sort(@pgs);
}

## Search for set definition files

sub get_set_defs {
	my $topdir = shift;
	my @found_set_defs;
	# get_set_defs_wanted is a closure over @found_set_defs
	my $get_set_defs_wanted = sub {
		#my $fn = $_;
		#my $fdir = $File::Find::dir;
		#return() if($fn !~ /^set.*\.def$/);
		##return() if(not -T $fn);
		#push @found_set_defs, "$fdir/$fn";
		push @found_set_defs, $_ if m|/set[^/]*\.def$|;
	};
	find({ wanted => $get_set_defs_wanted, follow_fast=>1, no_chdir=>1}, $topdir);
	map { $_ =~ s|^$topdir/?|| } @found_set_defs;
	return @found_set_defs;
}

## Try to make reading of set defs more flexible.  Additional strategies
## for fixing a path can be added here.

sub munge_pg_file_path {
	my $self = shift;
	my $pg_path = shift;
	my $path_to_set_def = shift;
	my $end_path = $pg_path;
	# if the path is ok, don't fix it
	return($pg_path) if(-e $self->r->ce->{courseDirs}{templates}."/$pg_path");
	# if we have followed a link into a self contained course to get
	# to the set.def file, we need to insert the start of the path to
	# the set.def file
	$end_path = "$path_to_set_def/$pg_path";
	return($end_path) if(-e $self->r->ce->{courseDirs}{templates}."/$end_path");
	# if we got this far, this path is bad, but we let it produce
	# an error so the user knows there is a troublesome path in the
	# set.def file.
	return($pg_path);
}

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

1;

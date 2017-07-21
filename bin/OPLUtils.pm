

package OPLUtils;
use base qw(Exporter);

use feature 'say';

# This file contains the subroutines that build JSON files from the database to help speed up the client side.
#
#  The following files are created:
#		1. $webwork_htdocs/DATA/library-directory-tree.json  (the directory structure of the library)
#		2. $webwork_htdocs/DATA/library-subject-tree.json  (the subject/chapter/section struture of the library)
#		3.

# This is used to create the file library-directory-tree.json which can be used to load in
# directory information for the OPL.  It writes the file as a JSON of directories to be easily loaded.

use strict;
use warnings;
use File::Find::Rule;
use File::Basename;
use open qw/:std :utf8/;
use Data::Dump qw/dump/;
use DBI;
use JSON;
use DBIx::Mint;

our @EXPORT    = ();
our @EXPORT_OK = qw/build_library_directory_tree build_library_subject_tree build_library_textbook_tree/;

### Data for creating the database tables


my %OPLtables = (
 dbsubject => 'OPL_DBsubject',
 dbchapter => 'OPL_DBchapter',
 dbsection => 'OPL_DBsection',
 author => 'OPL_author',
 path => 'OPL_path',
 pgfile => 'OPL_pgfile',
 keyword => 'OPL_keyword',
 pgfile_keyword => 'OPL_pgfile_keyword',
 textbook => 'OPL_textbook',
 chapter => 'OPL_chapter',
 section => 'OPL_section',
 problem => 'OPL_problem',
 morelt => 'OPL_morelt',
 pgfile_problem => 'OPL_pgfile_problem',
);


my %NPLtables = (
 dbsubject => 'NPL-DBsubject',
 dbchapter => 'NPL-DBchapter',
 dbsection => 'NPL-DBsection',
 author => 'NPL-author',
 path => 'NPL-path',
 pgfile => 'NPL-pgfile',
 keyword => 'NPL-keyword',
 pgfile_keyword => 'NPL-pgfile-keyword',
 textbook => 'NPL-textbook',
 chapter => 'NPL-chapter',
 section => 'NPL-section',
 problem => 'NPL-problem',
 morelt => 'NPL-morelt',
 pgfile_problem => 'NPL-pgfile-problem',
);


sub build_library_directory_tree {
	my $ce = shift;

	print "Creating the Directory Tree\n";
	my $libraryRoot = $ce->{problemLibrary}->{root};
	$libraryRoot =~ s|/+$||;

	my($filename, $directories) = fileparse($libraryRoot);

	my @dirArray = ();
	push(@dirArray,buildTree($libraryRoot));

	my $webwork_htdocs = $ce->{webwork_dir}."/htdocs";
	my $file = "$webwork_htdocs/DATA/library-directory-tree.json";

	# use a variable for the file handle
	my $OUTFILE;

	# use the three arguments version of open
	# and check for errors
	open $OUTFILE, '>', $file  or die "Cannot open $file";

	# you can check for errors (e.g., if after opening the disk gets full)
	print { $OUTFILE } to_json(\@dirArray) or die "Cannot write to $file";

	# check for errors
	close $OUTFILE or die "Cannot close $file";


	print "Wrote Library Directory Tree to $file\n";

}

###
#
#  I (pstaab) think this is obsolete.  Check then delete
#
##


sub buildTree {
	my $absoluteDir = shift;
	my $branch = {};
	my ($name,$dir) = fileparse($absoluteDir);
	$branch->{name} = $name;
	my @dirs = File::Find::Rule->maxdepth(1)->relative(1)->directory->in($absoluteDir);
	if (scalar(@dirs)==0){
		return undef;
	}

	my @branches = ();

	for my $dir (@dirs){
		my $theBranch = buildTree($absoluteDir . "/" . $dir);
		if ($theBranch) {
			my @files = File::Find::Rule->file()->name("*.pg")->in($absoluteDir . "/" . $dir);
			$theBranch->{num_files} = scalar(@files);
			push(@branches,$theBranch)
		} else {
			$b = {};
			$b->{name} = $dir;

			my @files = File::Find::Rule->file()->name("*.pg")->in($absoluteDir . "/" . $dir);

			#print $absoluteDir . "/" . $dir . "   " . $b->{num_files} . "\n";
			if (scalar(@files)>0){
				$b->{num_files} = scalar(@files);
				push(@branches,$b);
			}
		}
	}

	$branch->{subfields} = \@branches;
	my @files = File::Find::Rule->file()->name("*.pg")->in($absoluteDir);
	$branch->{num_files} = scalar(@files);


	return $branch;
}


sub build_library_subject_tree {
	my ($ce) = @_;

  my $dbh;

	my %tables = ($ce->{problemLibrary}->{version} eq '2.5')? %OPLtables : %NPLtables;



	my $selectClause = "select subj.name, ch.name, sect.name, path.path,pg.filename from `$tables{dbsection}` AS sect "
		."JOIN `$tables{dbchapter}` AS ch ON ch.DBchapter_id = sect.DBchapter_id "
		."JOIN `$tables{dbsubject}` AS subj ON subj.DBsubject_id = ch.DBsubject_id "
		."JOIN `$tables{pgfile}` AS pg ON sect.DBsection_id = pg.DBsection_id "
		."JOIN `$tables{path}` AS path ON pg.path_id = path.path_id ";

  my $rs = DBIx::Mint::ResultSet->new(table => $tables{dbsection})
              ->inner_join([$tables{dbchapter},'ch'],{'ch.DBchapter_id' => 'me.DBchapter_id'})
              ->inner_join([$tables{dbsubject},'subj'],{'subj.DBsubject_id' => 'ch.DBsubject_id'})
              ->inner_join([$tables{pgfile},'pg'],{'me.DBsection_id' => 'pg.DBsection_id'})
              ->inner_join([$tables{path},'path'],{'pg.path_id' => 'path.path_id'})
              ->select("subj.name","ch.name","me.name","path.path","pg.filename");

  my @subjects = map { $_->{name}} $rs->all;

  warn dump \@subjects;

  die "here";

	my $tree;  # the library subject tree will be stored as arrays of objects.

	my $results = $dbh->selectall_arrayref("select subj.name from `$tables{dbsubject}` AS subj");

	my @subject_names = map { $_->[0]} @{$results};

	my $i=0; # counter to print to the screen.

	print "Building the subject-tree.  There are " . scalar(@subject_names) . " subjects\n";

	my @subject_tree;  # array to store the individual library tree for each subject

	for my $subj_name (@subject_names){

		my $subj = $subj_name;
		$subj =~ s/'/\'/g;


		my $results = $dbh->selectall_arrayref("select ch.name from `$tables{dbsubject}` AS subj JOIN `$tables{dbchapter}` AS ch "
				. " ON subj.DBsubject_id = ch.DBsubject_id WHERE subj.name='$subj';");
		my @chapter_names = map {$_->[0]} @{$results};

		my @chapter_tree; # array to store the individual library tree for each chapter

		#print Dumper(\@chapter_names);

		for my  $ch_name (@chapter_names){

			my $ch = $ch_name;
			$ch =~ s/'/\'/g;

			my $results = $dbh->selectall_arrayref("SELECT sect.name from `$tables{dbsubject}` AS subj "
					."JOIN `$tables{dbchapter}` AS ch ON subj.DBsubject_id = ch.DBsubject_id "
					."JOIN `$tables{dbsection}` AS sect ON sect.DBchapter_id = ch.DBchapter_id "
					."WHERE subj.name='$subj' AND ch.name='$ch';");

			my @section_names = map { $_->[0]} @{$results};

			my @subfields = ();

			for my $sect_name (@section_names){
				my $section_tree = {};
				$section_tree->{name} = $sect_name;
				## Determine the number of files that falls into each

				my $sect = $section_tree->{name};
				$sect =~ s/'/\\'/g;

				my $whereClause ="WHERE sect.name='$sect' AND ch.name='$ch' AND subj.name='$subj'";

				my $sth = $dbh->prepare($selectClause.$whereClause);
				$sth->execute;
				my $numFiles= scalar @{$sth->fetchall_arrayref()};

				$section_tree->{num_files} = $numFiles;

				my $clone = { %{ $section_tree } };  # need to clone it before pushing into the @subfield array.

			    push(@subfields,$clone);
		    }

			my $chapter_tree;
			$chapter_tree->{name} = $ch_name;
			$chapter_tree->{subfields} = \@subfields;

			## determine the number of files in each chapter

			my $whereClause ="WHERE subj.name='$subj' AND ch.name='$ch'";


			my $sth = $dbh->prepare($selectClause.$whereClause);
			$sth->execute;
			my $numFiles = scalar @{$sth->fetchall_arrayref()};
			# my $allFiles = $sth->fetchall_arrayref;
			 $chapter_tree->{num_files} = $numFiles;

			my $clone = { %{ $chapter_tree } };  # need to clone it before pushing into the @chapter_tree array.
			push(@chapter_tree,$clone);



		}

		my $subject_tree;
		$subject_tree->{name} = $subj_name;
		$subject_tree->{subfields} = \@chapter_tree;

		## find the number of files on the subject level

		my $whereClause ="WHERE subj.name='$subj'";


		my $sth = $dbh->prepare($selectClause.$whereClause);
		$sth->execute;
		my $numFiles = scalar @{$sth->fetchall_arrayref()};
		$subject_tree->{num_files} = $numFiles;

		$i++;

		print sprintf("%3d", $i);

		if ($i%10 == 0) {
		    print "\n";
		}

		my $clone = { % {$subject_tree}};
		push (@subject_tree, $clone);
	}

	print "\n";

	my $webwork_htdocs = $ce->{webwork_dir}."/htdocs";
	my $file = "$webwork_htdocs/DATA/library-subject-tree.json";

	# use a variable for the file handle
	my $OUTFILE;

	# use the three arguments version of open
	# and check for errors
	open $OUTFILE, '>', $file  or die "Cannot open $file";

	# you can check for errors (e.g., if after opening the disk gets full)
	print { $OUTFILE } to_json(\@subject_tree,{pretty=>1}) or die "Cannot write to $file";

	# check for errors
	close $OUTFILE or die "Cannot close $file";


	print "Wrote Library Subject Tree to $file\n";
}

sub get_all_problems {
  my $ce = shift;
	my %tables = ($ce->{problemLibrary}->{version} eq '2.5')? %OPLtables : %NPLtables;
  return DBIx::Mint::ResultSet->new(table=>$tables{path})
            ->inner_join([$tables{pgfile}, 'pg'], { 'me.path_id' => 'pg.path_id' })
            ->left_join([$tables{pgfile_problem}, 'pgprob'], { 'pgprob.pgfile_id'=>'pg.pgfile_id' })
            ->left_join([$tables{problem},'prob'],{'prob.problem_id' => 'pgprob.problem_id'})
            ->left_join([$tables{section},'sect'],{'sect.section_id' => 'prob.section_id'})
            ->left_join([$tables{chapter},'ch'],{'ch.chapter_id' => 'sect.chapter_id'})
            ->left_join([$tables{textbook},'text'],{'text.textbook_id' => 'ch.textbook_id'});
}

sub build_library_textbook_tree {

	my ($ce,$dbh) = @_;

	my $libraryRoot = $ce->{problemLibrary}->{root};
	$libraryRoot =~ s|/+$||;

	my %tables = ($ce->{problemLibrary}->{version} eq '2.5')? %OPLtables : %NPLtables;

  my $rs = DBIx::Mint::ResultSet->new(table=>$tables{textbook})
              ->order_by("title")
              ->set_target_class("Models::Library::Textbook");

  my @textbooks = $rs->all; # map {$_->{title} . " -- " . $_->{author}}$rs->all;

  # die "here";
  #
	my $selectClause = "SELECT pg.pgfile_id from `$tables{path}` as path "
		."LEFT JOIN `$tables{pgfile}` AS pg ON pg.path_id=path.path_id "
		."LEFT JOIN `$tables{pgfile_problem}` AS pgprob ON pgprob.pgfile_id=pg.pgfile_id "
		."LEFT JOIN `$tables{problem}` AS prob ON prob.problem_id=pgprob.problem_id "
		."LEFT JOIN `$tables{section}` AS sect ON sect.section_id=prob.section_id "
		."LEFT JOIN `$tables{chapter}` AS ch ON ch.chapter_id=sect.chapter_id "
		."LEFT JOIN `$tables{textbook}` AS text ON text.textbook_id=ch.textbook_id ";

	# my $results = $dbh->selectall_arrayref("select * from `$tables{textbook}` ORDER BY title;");
  #
	# my @textbooks=map { {textbook_id=>$_->[0],title=>$_->[1],edition=>$_->[2],
	# 		author=>$_->[3],publisher=>$_->[4],isbn=>$_->[5],pubdate=>$_->[6]}} @{$results};
  #
	my @output = ();

	my $i =0; ## index to alert user the length of the build

	print "Building the Textbook Library Tree\n";
	print "There are ". $#textbooks ." textbooks to process.\n";

	for my $textbook (@textbooks){
		$i++;
		#printf("%4d",$i);
		#print("\n") if ($i %10==0);

    ## find the total number of problems for a given textbook

    my $num_problems = get_all_problems($ce)->search({'text.textbook_id' => $textbook->{textbook_id}})->count;

    say $textbook->{title} . " : ". $num_problems;

    ## for each textbook, find all of the given chapters

    my $rs = DBIx::Mint::ResultSet->new(table=>$tables{textbook})
                ->inner_join([$tables{chapter},'ch'],{'ch.textbook_id' => 'me.textbook_id'})
                ->select('ch.name')
                ->search({'ch.textbook_id' => $textbook->{textbook_id}})
                ->order_by("ch.number");


    my @chaps = $rs->all;



  }


	# 	my $results = $dbh->selectall_arrayref("select ch.chapter_id,ch.name,ch.number "
	# 		. " from `$tables{chapter}` AS ch JOIN `$tables{textbook}` AS text ON ch.textbook_id=text.textbook_id "
	# 		. " WHERE text.textbook_id='" . $textbook->{textbook_id} . "' ORDER BY ch.number;");
  #
	# 	my @chapters=map { {chapter_id=>$_->[0],name=>$_->[1],number=>$_->[2]}} @{$results};
  #
	# 	my @chs = ();
  #
	# 	for my $chapter (@chapters){
  #
	# 		my $results = $dbh->selectall_arrayref("select sect.section_id,sect.name,sect.number "
	# 			. "FROM `$tables{chapter}` AS ch "
	# 			. "LEFT JOIN `$tables{textbook}` AS text ON ch.textbook_id=text.textbook_id "
	# 			. "LEFT JOIN `$tables{section}` AS sect ON sect.chapter_id = ch.chapter_id "
	# 			. "WHERE text.textbook_id='" .$textbook->{textbook_id}. "' AND "
	# 			. "ch.chapter_id='".$chapter->{chapter_id}."' ORDER BY sect.number;");
  #
  #
	# 		my @sections = map { {section_id=>$_->[0],name=>$_->[1],number=>$_->[2]}} @{$results};
  #
	# 		for my $section (@sections){
  #
	# 	   		my $whereClause ="WHERE sect.section_id='". $section->{section_id}
	# 	   			."' AND ch.chapter_id='". $chapter->{chapter_id}."' AND "
	# 	   				."text.textbook_id='".$textbook->{textbook_id}."'";
  #
	# 			my $sth = $dbh->prepare($selectClause.$whereClause);
	# 			$sth->execute;
	# 			$section->{num_probs}=scalar @{$sth->fetchall_arrayref()};
  #
	# 		}
	# 		my $whereClause ="WHERE ch.chapter_id='". $chapter->{chapter_id}."' AND "
	#    				."text.textbook_id='".$textbook->{textbook_id}."'";
  #
	# 		my $sth = $dbh->prepare($selectClause.$whereClause);
	# 		$sth->execute;
	# 		$chapter->{num_probs}=scalar @{$sth->fetchall_arrayref()};
  #
	# 		$chapter->{sections}=\@sections;
  #
	# 		my @sects = map {{name=>$_->{name}, num_files=>$_->{num_probs} } } @sections;
  #
	# 		push(@chs,{name=>$chapter->{name},num_files=>$chapter->{num_probs},subfields=>\@sects});
  #
	# 	}
	# 	my $whereClause ="WHERE text.textbook_id='".$textbook->{textbook_id}."'";
  #
	# 	my $sth = $dbh->prepare($selectClause.$whereClause);
	# 	$sth->execute;
	# 	$textbook->{num_probs}=scalar @{$sth->fetchall_arrayref()};
  #
	# 	$textbook->{chapters}=\@chapters;
  #
	# 	push(@output,{name=>$textbook->{title}. " - " . $textbook->{author},subfields=>\@chs,num_files=>$sth->rows});
	# }

	print "\n";

	my $webwork_htdocs = $ce->{webwork_dir}."/htdocs";
	my $file = "$webwork_htdocs/DATA/textbook-tree.json";

	# use a variable for the file handle
	my $OUTFILE;

	# use the three arguments version of open
	# and check for errors
	open $OUTFILE, '>', $file  or die "Cannot open $file";

	# you can check for errors (e.g., if after opening the disk gets full)
	print { $OUTFILE } to_json(\@output,{pretty=>1}) or die "Cannot write to $file";

	# check for errors
	close $OUTFILE or die "Cannot close $file";


	print "\n\nWrote Library Textbook Tree to $file\n";

}

# Get an id, and add entry to the database if needed
sub safe_get_id {
	my ($dbh,$tablename,$idname,$whereclause,$wherevalues,$addifnew,@insertvalues) = @_;

	my $query = "SELECT $idname FROM `$tablename` ".$whereclause;
	my $sth = $dbh->prepare($query);
	$sth->execute(@$wherevalues);
	my $idvalue;
  my @row;
	unless(@row = $sth->fetchrow_array()) {
		return 0 unless $addifnew;
		for my $j (0..$#insertvalues) {
			#print "Looking at ".$insertvalues[$j]."\n";
			if ($insertvalues[$j] ne "") {
				$insertvalues[$j] = '"'.$insertvalues[$j].'"';
			} else {
				$insertvalues[$j] = undef;
			}
		}
		#print "INSERT INTO $tablename VALUES( ".join(',',@insertvalues).")\n";
		$dbh->do("INSERT INTO `$tablename` VALUES(". join(',',@insertvalues) .")");
		say "INSERT INTO $tablename VALUES( ".join(',',@insertvalues).")" if $WeBWorK::Constants::VERBOSE;
		$sth = $dbh->prepare($query);
		$sth->execute(@$wherevalues);
		@row = $sth->fetchrow_array();
	}
	$idvalue = $row[0];
	return($idvalue);
}

sub isvalid {
	my ($tags,$taxo) = @_;
	if(not defined $taxo->{$tags->{DBsubject}}) {
		print "\nInvalid subject ".$tags->{DBsubject}."\n";
		return 0;
	}
	if(not ($tags->{DBchapter} eq 'Misc.') and not defined $taxo->{$tags->{DBsubject}}->{$tags->{DBchapter}}) {
		print "\nInvalid chapter ".$tags->{DBchapter}."\n";
		return 0;
	}
	if(not ($tags->{DBsection} eq 'Misc.') and not defined $taxo->{$tags->{DBsubject}}->{$tags->{DBchapter}}->{$tags->{DBsection}}) {
		print "\nInvalid section ".$tags->{DBsection}."\n";
		return 0;
	}
	return 1;
}


sub readTextbooks {
  #### First read in textbook information
  my ($ce,$dbh,$libraryRoot) =@_;

	my $libraryVersion = $ce->{problemLibrary}->{version};
 	my %tables = ($libraryVersion eq '2.5')? %OPLtables : %NPLtables;


  if(open(IN, "$libraryRoot/Textbooks")) {
  	print "Reading in textbook data from Textbooks in the library $libraryRoot.\n";
  	my %textinfo = ( TitleText => '', EditionText =>'', AuthorText=>'');
  	my $bookid = undef;
  	while (my $line = <IN>) {
  		$line =~ s|#*$||;
  		if($line =~ /^\s*(.*?)\s*>>>\s*(.*?)\s*$/) { # Should have chapter or section information
  			my $chapsec = $1;
  			my $title = $2;
  			if($chapsec=~ /(\d+)\.(\d+)/) { # We have a section
  				if(defined($bookid)) {
            my $chapter = $tables{chapter};
  					my $query = "SELECT chapter_id FROM `$chapter` WHERE textbook_id = \"$bookid\" AND number = \"$1\"";
  					my $chapid = $dbh->selectrow_array($query);
  					if(defined($chapid)) {
  						my $sectid = safe_get_id($dbh,$tables{section}, 'section_id',
  							qq(WHERE chapter_id = ? and name = ?), [$chapid, $title], 1, "", $chapid, $2, $title, "");
  					} else {
  						print "Cannot enter section $chapsec because textbook information is missing the chapter entry\n";
  					}
  				} else {
  					print "Cannot enter section $chapsec because textbook information is incomplete\n";
  				}
  			} else { # We have a chapter entry
  				if(defined($bookid)) {
  					my $chapid = safe_get_id($dbh,$tables{chapter}, 'chapter_id',
  						qq(WHERE textbook_id = ? AND number = ?), [$bookid, $chapsec], 1, "", $bookid, $chapsec, $title, "");

  						# Add dummy section entry for problems tagged to the chapter
  						# without a section
              my $section = $tables{section};
  						my $query = "SELECT section_id FROM `$section` WHERE chapter_id = \"$chapid\" AND number = -1";
  						my $sectid = $dbh->selectrow_array($query);
  						if (!defined($sectid)) {
  							$dbh->do("INSERT INTO `$section`
  						VALUES(
  							NULL,
  							\"$chapid\",
  							\"-1\",
  							\"\",
  							NULL
  						)"
  								);
  						say "INSERT INTO section VALUES(\"\", \"$chapid\", \"-1\", \"\", \"\" )" if $WeBWorK::Constants::VERBOSE;
  						}
  				} else {
  					print "Cannot enter chapter $chapsec because textbook information is incomplete\n";
  				}
  			}
  		} elsif($line =~ /^\s*(TitleText|EditionText|AuthorText)\(\s*'(.*?)'\s*\)/) {
  			# Textbook information, maybe new
  			my $type = $1;
  			if(defined($textinfo{$type})) { # signals new text
  				%textinfo = ( TitleText => undef,
  							  EditionText =>undef,
  							  AuthorText=> undef);
  				$textinfo{$type} = $2;
  				$bookid = undef;
  			} else {
  				$textinfo{$type} = $2;
  				if(defined($textinfo{TitleText}) and
  				   defined($textinfo{AuthorText}) and
  				   defined($textinfo{EditionText})) {
               my $textbook = $tables{textbook};
  					my $query = "SELECT textbook_id FROM `$textbook` WHERE title = \"$textinfo{TitleText}\" AND edition = \"$textinfo{EditionText}\" AND author=\"$textinfo{AuthorText}\"";
  					$bookid = $dbh->selectrow_array($query);
  					if (!defined($bookid)) {
  						$dbh->do("INSERT INTO `$textbook`
  					VALUES(
  						NULL,
  						\"$textinfo{TitleText}\",
  						\"$textinfo{EditionText}\",
  						\"$textinfo{AuthorText}\",
  						NULL,
  						NULL,
  						NULL
  					)"
  							);
  						say "INSERT INTO textbook VALUES( \"\", \"$textinfo{TitleText}\", \"$textinfo{EditionText}\", \"$textinfo{AuthorText}\", \"\", \"\", \"\" )" if $WeBWorK::Constants::VERBOSE;
  						$bookid = $dbh->selectrow_array($query);
  					}
  				}
  			}
  		}
  	}
  	close(IN);
  } else {
  	print "Textbooks file was not found in library $libraryRoot. If the path to the problem library doesn't seem
  	correct, make modifications in webwork2/conf/localOverrides.conf (\$problemLibrary{root}).  If that is correct then
  	updating from git should download the Textbooks file.\n";
  }

}

sub readTaxonomy {
  my ($ce,$dbh,$taxo,$libraryRoot) = @_;

  my $clsep = '<<<';
  my $clinner = '__';
  my @cllist = ();
  # Record full taxonomy for tagging menus (does not include cross-lists)
  my $tagtaxo = [];
  my ($chaplist, $seclist) = ([],[]);

	my $libraryVersion = $ce->{problemLibrary}->{version};
	my %tables = ($libraryVersion eq '2.5')? %OPLtables : %NPLtables;

  my $canopenfile = 0;
  if(open(IN, "$libraryRoot/Taxonomy2")) {
  	print "Reading in OPL taxonomy from Taxonomy2 in the library $libraryRoot.\n";
  	$canopenfile = 1;
  } elsif(open(IN, "$libraryRoot/Taxonomy")) {
  	print "Reading in OPL taxonomy from Taxonomy in the library $libraryRoot.\n";
  	$canopenfile = 1;
  } else {
  	print "Taxonomy file was not found in library $libraryRoot. If the path to the problem library doesn't seem
  	correct, make modifications in webwork2/conf/site.conf (\$problemLibrary{root}).  If that is correct then
  	updating from git should download the Taxonomy file.\n";
  }

  # Taxonomy is a subset of Taxonomy2, so we can use the same code either way
  if($canopenfile) {
  	my ($cursub,$curchap); # these are strings
  	my ($subj, $chap, $sect); # these are indeces
  	while(my $line = <IN>) {
  		$line =~ /^(\t*)/;
  		my $count = length($1);
  		my $oktag = 1;
  		chomp($line);
  		if($line =~ m/$clsep/) {
  			$oktag = 0;
  			my @cross = split $clsep, $line;
  			@cross = map(trim($_), @cross);
  			if(scalar(@cross) > 1) {
  				push @cllist, [join($clinner, ($cursub,$curchap,$cross[0])) ,$cross[1]];
  			}
  			$line = $cross[0];
  		}
  		$line = trim($line);

  		# We put the line in the database in all cases
  		# but crosslists are not put in the heierarchy of legal tags
  		# instead they go in a list of crosslists to deal with after
  		# the full taxonomy is read in
  		if($count == 0) { #DBsubject
  			$cursub = $line;
  			if($oktag) {
  				$taxo->{$line} = {};
  				($chaplist, $seclist) = ([],[]);
  				push @{$tagtaxo}, {name=>$line, subfields=>$chaplist};
  			}
  			$subj = safe_get_id($dbh,$tables{dbsubject}, 'DBsubject_id',
  				qq(WHERE name = ?), [$line], 1, "", $line);
  		} elsif($count == 1) { #DBchapter
  			if($oktag) {
  				$taxo->{$cursub}->{$line} = {};
  				$seclist=[];
  				push @{$chaplist}, {name=>$line, subfields=>$seclist};
  			}
  			$curchap = $line;
  			$chap = safe_get_id($dbh,$tables{dbchapter}, 'DBchapter_id',
  				qq(WHERE name = ? and DBsubject_id = ?), [$line, $subj], 1, "", $line, $subj);
  		} else { #DBsection
  			if($oktag) {
  				$taxo->{$cursub}->{$curchap}->{$line} = [];
  				push @{$seclist}, {name=>$line};
  			}
  			$sect = safe_get_id($dbh,$tables{dbsection}, 'DBsection_id',
  				qq(WHERE name = ? and DBchapter_id = ?), [$line, $chap], 1, "", $line, $chap);
  		}
  	}
  	close(IN);
  }
  #### End of taxonomy/taxonomy2

  #### Save the official taxonomy in json format
  my $webwork_htdocs = $ce->{webwork_dir}."/htdocs";
  my $file = "$webwork_htdocs/DATA/tagging-taxonomy.json";
  open(OUTF, ">$file") or die "Cannot open $file";
  print OUTF to_json($tagtaxo,{pretty=>1}) or die "Cannot write to $file";
  close(OUTF);
  print "Saved taxonomy to $file.\n";

  #### Now deal with cross-listed sections
  for my $clinfo (@cllist) {
  	my @scs = split /$clinner/, $clinfo->[1];
  	if(defined $taxo->{$scs[0]}->{$scs[1]}->{$scs[2]}) {
  			push @{$taxo->{$scs[0]}->{$scs[1]}->{$scs[2]}}, $clinfo->[0];
  	} else {
  		print "Faulty cross-list: pointing to $scs[0] / $scs[1] / $scs[2]\n";
  	}
  }
}

sub trim {
	my $str = shift;
	$str =~ s/^\s+//;
	$str =~ s/\s+$//;
	return $str;
}

sub kwtidy {
	my $s = shift;
	$s =~ s/\W//g;
	$s =~ s/_//g;
	$s = lc($s);
	return($s);
}

sub keywordcleaner {
	my $string = shift;
	my @spl1 = split /,/, $string;
	my @spl2 = map(kwtidy($_), @spl1);
	return(@spl2);
}

# Initialize, if needed more text-info information;
sub maybenewtext {
	my ($textinfo,$textno) = @_;
	return if defined($textinfo->{$textno});
	# So, not defined yet
	$textinfo->{$textno} = { title => '', author =>'', edition =>'',
						   section => '', chapter =>'', problems => [] };
}

# process each file returned by the find command.
sub pgfiles {
  my ($ce,$dbh,$taxo) = @_;
	my $name = $File::Find::name;
	my ($text, $edition, $textauthor, $textsection, $textproblem);
	my %textinfo=();
	my @textproblems = (-1);
  my $libraryRoot = $ce->{problemLibrary}->{root};

	my $libraryVersion = $ce->{problemLibrary}->{version};
	my %tables = ($libraryVersion eq '2.5')? %OPLtables : %NPLtables;
#print "\n$name";

	if ($name =~ /swf$/) { # Found a flash applet
		my $applet_file = basename($name);
		symlink($name,$ce->{webworkDirs}->{htdocs}."/applets/".$applet_file);
	}

	if ($name =~ /\.pg$/) {
		my $pgfile = basename($name);
		my $pgpath = dirname($name);
		my $cnt2++;
		printf("%6d", $cnt2) if(($cnt2 % 100) == 0);
		print "\n" if(($cnt2 % 1000) == 0);

		$pgpath =~ s|^$libraryRoot/||;
		my $tags = WeBWorK::Utils::Tags->new($name);
    my $aDBsection_id;

		if ($tags->istagged()) {
			# Fill in missing data with Misc. instead of blank
			print "\nNO SUBJECT $name\n" unless ($tags->{DBsubject} =~ /\S/);

			$tags->{DBchapter} = 'Misc.' unless $tags->{DBchapter} =~ /\S/;
			$tags->{DBsection} = 'Misc.' unless $tags->{DBsection} =~ /\S/;

			# DBsubject table

			if(isvalid($tags,$taxo)) {
				my $DBsubject_id = safe_get_id($dbh,$tables{dbsubject}, 'DBsubject_id',
					qq(WHERE BINARY name = ?), [$tags->{DBsubject}], 1, "", $tags->{DBsubject});
				if(not $DBsubject_id) {
					print "\nInvalid subject '$tags->{DBsubject}' in $name\n";
					next;
				}

				# DBchapter table

				my $DBchapter_id = safe_get_id($dbh,$tables{dbchapter}, 'DBchapter_id',
					qq(WHERE BINARY name = ? and DBsubject_id = ?), [$tags->{DBchapter}, $DBsubject_id], 1, "", $tags->{DBchapter}, $DBsubject_id);
				if(not $DBchapter_id) {
					print "\nInvalid chapter '$tags->{DBchapter}' in $name\n";
					next;
				}

				# DBsection table

				$aDBsection_id = safe_get_id($dbh,$tables{dbsection}, 'DBsection_id',
					qq(WHERE BINARY name = ? and DBchapter_id = ?), [$tags->{DBsection}, $DBchapter_id], 1, "", $tags->{DBsection}, $DBchapter_id);
				if(not $aDBsection_id) {
					print "\nInvalid section '$tags->{DBsection}' in $name\n";
					next;
				}
			} else { # tags are not valid, error printed by validation part
				print "File $name\n";
				next;
			}
      my $clinner = '__';
			my @DBsection_ids=($aDBsection_id);
			# Now add crosslisted section
			my @CL_array = @{$taxo->{$tags->{DBsubject}}->{$tags->{DBchapter}}->{$tags->{DBsection}}};
			for my $clsect (@CL_array) {
				my @np = split /$clinner/, $clsect;
				@np = map(trim($_), @np);
				my $new_dbsubj_id = safe_get_id($dbh,$tables{dbsubject}, 'DBsubject_id',
					qq(WHERE name = ?), [$np[0]], 1, "", $np[0]);
				my $new_dbchap_id = safe_get_id($dbh,$tables{dbchapter}, 'DBchapter_id',
					qq(WHERE name = ? and DBsubject_id = ?), [$np[1], $new_dbsubj_id], 1, "", $np[1], $new_dbsubj_id);
				my $new_dbsect_id = safe_get_id($dbh,$tables{dbsection}, 'DBsection_id',
					qq(WHERE name = ? and DBchapter_id = ?), [$np[2], $new_dbchap_id], 1, "", $np[2], $new_dbchap_id);
				push @DBsection_ids, $new_dbsect_id;
			}

			# author table

			$tags->{Author} =~ /(.*?)\s(\w+)\s*$/;
			my $firstname = $1;
			my $lastname = $2;
			#remove leading and trailing spaces from firstname, which includes any middle name too.
			$firstname =~ s/^\s*//;
			$firstname =~ s/\s*$//;
			$lastname =~ s/^\s*//;
			$lastname =~ s/\s*$//;
			my $author_id = 0;
			if($lastname) {
				$author_id = safe_get_id($dbh,$tables{author}, 'author_id',
					qq(WHERE lastname = ? AND firstname = ?), [$lastname, $firstname], 1, "", $tags->{Institution}, $lastname, $firstname,"");
			}

			# path table

			my $path_id = safe_get_id($dbh,$tables{path}, 'path_id',
				qq(WHERE path = ?), [$pgpath], 1, "", $pgpath, "", "");

			# pgfile table -- set 4 defaults first

			## TODO this is where we have to deal with crosslists, and pgfileid
			##      will be an array of id's
			##      Make an array of DBsection-id's above

			my $level = $tags->{Level} || 0;
			# Default language is English
			my $lang = $tags->{Language} || "en";
			my $mathobj = $tags->{MO} || 0;
			my $static = $tags->{Static} || 0;

			my @pgfile_ids = ();

			for my $DBsection_id (@DBsection_ids) {
				my $pgfile_id = safe_get_id($dbh,$tables{pgfile}, 'pgfile_id',
					qq(WHERE filename = ? AND path_id = ? AND DBsection_id = ? ), [$pgfile, $path_id, $DBsection_id], 1, "", $DBsection_id, $author_id, $tags->{Institution}, $path_id, $pgfile, 0, $level, $lang, $static, $mathobj);
				push @pgfile_ids, $pgfile_id;
			}
#if (scalar(@pgfile_ids)>1) {
 # print "\npg ".join(', ', @pgfile_ids)."\n";
#}

			# morelt table

			my $morelt_id;
			if($tags->{MLT}) {
				for my $DBsection_id (@DBsection_ids) {
					$morelt_id = safe_get_id($dbh,$tables{morelt}, 'morelt_id',
						qq(WHERE name = ?), [$tags->{MLT}], 1, "", $tags->{MLT}, $DBsection_id, "");

					for my $pgfile_id (@pgfile_ids) {
						$dbh->do("UPDATE `$tables{pgfile}` SET
							morelt_id = \"$morelt_id\" WHERE pgfile_id = \"$pgfile_id\" ");

						say "UPDATE pgfile morelt_id for $pgfile_id to $morelt_id" if $WeBWorK::Constants::VERBOSE;
						if($tags->{MLTleader}) {
							$dbh->do("UPDATE `$tables{morelt}` SET
									leader = \"$pgfile_id\" WHERE morelt_id = \"$morelt_id\" ");
							say "UPDATE morelt leader for $morelt_id to $pgfile_id" if $WeBWorK::Constants::VERBOSE;
						}
					}
				}
			}

			# keyword table, and problem_keyword many-many table

			foreach my $keyword (@{$tags->{keywords}}) {
				$keyword =~ s/[\'\"]//g;
				$keyword = kwtidy($keyword);
                                # skip it if it is empty
                                next unless $keyword;
				my $keyword_id = safe_get_id($dbh,$tables{keyword}, 'keyword_id',
					qq(WHERE keyword = ?), [$keyword], 1, "", $keyword);

				for my $pgfile_id (@pgfile_ids) {
					my $query = "SELECT pgfile_id FROM `$tables{pgfile_keyword}` WHERE keyword_id = \"$keyword_id\" and pgfile_id=\"$pgfile_id\"";
					my $ok = $dbh->selectrow_array($query);
					if (!defined($ok)) {
						$dbh->do("INSERT INTO `$tables{pgfile_keyword}`
							VALUES(
								\"$pgfile_id\",
								\"$keyword_id\"
							)"
								);
						say "INSERT INTO pgfile_keyword VALUES( \"$pgfile_id\", \"$keyword_id\" )" if $WeBWorK::Constants::VERBOSE;
					}
				}
			}					#end foreach keyword

			# Textbook section
			# problem table contains textbook problems

			for my $texthashref (@{$tags->{textinfo}}) {

				# textbook table

				$text = $texthashref->{TitleText};
				$edition = $texthashref->{EditionText} || 0;
				$edition =~ s/[^\d\.]//g;
				$textauthor = $texthashref->{AuthorText};
				next unless($text and $textauthor);
				my $chapnum = $texthashref->{chapter} || -1;
				my $secnum = $texthashref->{section} || -1;
				my $query = "SELECT textbook_id FROM `$tables{textbook}` WHERE title = \"$text\" AND edition = \"$edition\" AND author=\"$textauthor\"";
				my $textbook_id = $dbh->selectrow_array($query);
				if (!defined($textbook_id)) {
 				        # make sure edition is an integer
				        $edition = 0 unless $edition;
					$dbh->do("INSERT INTO `$tables{textbook}`
					VALUES(
						NULL,
						\"$text\",
						\"$edition\",
						\"$textauthor\",
						NULL,
						NULL,
						NULL
					)"
							);
					say "INSERT INTO textbook VALUES( \"\", \"$text\", \"$edition\", \"$textauthor\", \"\", \"\", \"\" )" if $WeBWorK::Constants::VERBOSE;
					say "\nLate add into $tables{textbook} \"$text\", \"$edition\", \"$textauthor\"" if $WeBWorK::Constants::VERBOSE;
					$textbook_id = $dbh->selectrow_array($query);
				}

				# chapter weak table of textbook
				#
				$query = "SELECT chapter_id FROM `$tables{chapter}` WHERE textbook_id = \"$textbook_id\" AND number = \"$chapnum\"";
				my $chapter_id = $dbh->selectrow_array($query);
				if (!defined($chapter_id)) {
					$dbh->do("INSERT INTO `$tables{chapter}`
					VALUES(
						NULL,
						\"$textbook_id\",
						\"".$chapnum."\",
						\"$tags->{DBchapter}\",
						NULL
					)"
							);
					say "\nLate add into $tables{chapter} \"$text\", \"$edition\", \"$textauthor\", $chapnum $tags->{chapter} from $name" if $WeBWorK::Constants::VERBOSE;
					say "INSERT INTO chapter VALUES(\"\", \"$textbook_id\", \"".$chapnum."\", \"$tags->{DBchapter}\", \"\" )" if $WeBWorK::Constants::VERBOSE;
					$chapter_id = $dbh->selectrow_array($query);
				}

				# section weak table of textbook
				#
				$tags->{DBsection} = '' if ($secnum < 0);
				$query = "SELECT section_id FROM `$tables{section}` WHERE chapter_id = \"$chapter_id\" AND number = \"$secnum\"";
				my $section_id = $dbh->selectrow_array($query);
				if (!defined($section_id)) {
					$dbh->do("INSERT INTO `$tables{section}`
					VALUES(
						NULL,
						\"$chapter_id\",
						\"$secnum\",
						\"$tags->{DBsection}\",
						NULL
					)"
							);
					say "INSERT INTO section VALUES(\"\", \"$textbook_id\", \"$secnum\", \"$tags->{DBsection}\", \"\" )"  if $WeBWorK::Constants::VERBOSE;
					say "\nLate add into $tables{section} \"$text\", \"$edition\", \"$textauthor\", $secnum $tags->{DBsection} from $name" if $WeBWorK::Constants::VERBOSE;
					$section_id = $dbh->selectrow_array($query);
				}

				@textproblems = @{$texthashref->{problems}};
				for my $tp (@textproblems) {
					$query = "SELECT problem_id FROM `$tables{problem}` WHERE section_id = \"$section_id\" AND number = \"$tp\"";
					my $problem_id = $dbh->selectrow_array($query);
					if (!defined($problem_id)) {
						$dbh->do("INSERT INTO `$tables{problem}`
					VALUES(
						NULL,
						\"$section_id\",
						\"$tp\",
						NULL
					)"
								);
						say "INSERT INTO problem VALUES( \"\", \"$section_id\", \"$tp\", \"\" )" if $WeBWorK::Constants::VERBOSE;
						$problem_id = $dbh->selectrow_array($query);
					}

					# pgfile_problem table associates pgfiles with textbook problems
					for my $pgfile_id (@pgfile_ids) {
						$query = "SELECT problem_id FROM `$tables{pgfile_problem}` WHERE problem_id = \"$problem_id\" AND pgfile_id = \"$pgfile_id\"";
						my $pg_problem_id = $dbh->selectrow_array($query);
						if (!defined($pg_problem_id)) {
							$dbh->do("INSERT INTO `$tables{pgfile_problem}`
						VALUES(
							\"$pgfile_id\",
							\"$problem_id\"
						)"
									);
							say "INSERT INTO pgfile_problem VALUES( \"$pgfile_id\", \"$problem_id\" )"  if $WeBWorK::Constants::VERBOSE;
						}
					}
				}

				#reset tag vars, they may not match the next text/file
				$textauthor=""; $textsection="";
			}
		} else { # This file was not tagged
			# Message if not a pointer
			# print STDERR "File $name is not tagged\n" if not $tags->isplaceholder();
			;
		}
	}
}


1;

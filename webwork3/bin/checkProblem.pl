#!/usr/bin/perl -w

use strict;
use warnings;

use JSON;
use File::Slurp;
use HTML::Entities;
use Getopt::Long;
use Data::Dumper;
use Regexp::Common; 

BEGIN {
        die "WEBWORK_ROOT not found in environment.\n"
                unless exists $ENV{WEBWORK_ROOT};
}

my $WW_ROOT = $ENV{WEBWORK_ROOT};

my $verbose = '';	# option variable with default value (false)
my $outputFile = $WW_ROOT . "/../libraries/t/check_library_output.txt";
my $showErrors = '';
my $showWarnings = '';
my $testRandomize = '';
my $showInBrowser = '';
my $showHelp = '';
my $courseName = 'maa101';
my $user = 'profa';
my $password = 'profa';
#my $courseName = 'staab_course';
my $checkMissingAltTag = '';
#my $hostname = "https://webwork.fitchburgstate.edu";
my $hostname = "localhost";
my @warnings = ();

GetOptions ('verbose' => \$verbose, 'output:s' => \$outputFile, 'show-errors' => \$showErrors,
		'show-warnings' => \$showWarnings, 'check-for-randomize' => \$testRandomize,
		'show-in-browser' => \$showInBrowser, 'check-missing-alt-tag' => \$checkMissingAltTag,
		'help' =>\$showHelp);

if($showHelp){
	showHelp();
	exit;
}
my $results = "";

my $out = loginToServer();
my $session = from_json($out);
if(!$session->{logged_in}){
	die "You were not able to log in.  Please check the credentials.";
}

open(my $fh, '>>', $outputFile) or die "Could not open file '$outputFile' $!";	


# auto flush printing
my $so = select(STDOUT);
$| = 1;
select($so);


if (@ARGV) {
	if($showInBrowser){
		showInBrowser();
		exit 1;
	}

	for my $filename (@ARGV){
		checkFile($filename);			
	}
	
	print $fh $results;
	if($showWarnings and scalar(@warnings)>0){
		print $fh join("\n",@warnings) . "\n";
	}

} else {
   showHelp();
}


close $fh;

sub checkFile {
	my $file = shift;

	my $file_source = read_file $file || die "Could not open file $file";
	my $data = encode_entities $file_source;
	my $output;
	my $parse; 
	my $isRandom; 

	if($testRandomize){
		$isRandom = checkForRandomize($data)->{is_random};
	} else {
		$output = renderOnServer($data);
		$parse = from_json($output);
		# print "$output\n";
	}

	if($parse->{errors} or $parse->{error}){
		printResults("0\t $file has errors.");
		if($showErrors){
			printResults(($parse->{errors} || "" ) . ($parse->{error} || ""));
		}
	} else {
		printResults("1\t $file is ok.");
		if($testRandomize){
			printResults("\trandom: ". ($isRandom || 0 ));
		} 
	}
	if($showWarnings){
		$results .= $parse->{warnings} if $parse->{warnings};
		for my $key ("debug_messages","warning_messages"){
			my @tmp = map {@$_} @{$parse->{$key}};# flatten the array to a string.
			push(@warnings, @tmp);
		}
	}	
	if($checkMissingAltTag){
		printResults("\t\tmissing alt tag: ". isAltTagMissing($file_source));
	}

	printResults("\n");
}

# this logs into the server to start a session and then a cookie is stored. 

sub loginToServer {
	print "in loginToServer\n";
	my $flags = "-s -c /tmp/dancer-cookies -X POST -d user=$user -d password=$password ";
	return qx!curl $flags $hostname/webwork3/courses/$courseName/login!;
}

sub renderOnServer {
	my ($data,$seed) = @_;
	my $flags = "-s -b /tmp/dancer-cookies -X POST --data-urlencode 'source=$data' -d course_id=$courseName " . 
					 (defined($seed) ? "-d seed=$seed" : "");
	return qx!curl $flags $hostname/webwork3/renderer!;
}

sub printResults {
	$results = shift;
	print $fh $results;
	print $results if $verbose;
}

sub showHelp {
   print "usage: checkProblem [flags] filename \n\n";
   print "flags: \n";
   print "\t --verbose: \t\t send the output to the commandline as well as the output file.\n";
   print "\t --show-errors: \t print the errors (default: hides the errors)\n";
   print "\t --show-warnings: \t print the errors (default: hides the warnings)\n";
   print "\t --test-randomize: \t tests if the problem has randomization. (default: don't check)\n";
   print "\t --show-in-browser: \t opens the result in a browser.\n";
   print "\t --output output_file: \t send the output to output_file.  (default: $outputFile)\n";

}

sub checkForRandomize {
	my $data = shift;
	my $isRandom = "";
	my $n=0;
	my $output = renderOnServer($data,int(rand(10000)));
	my $parse = from_json($output);
	do {
		my $output2 = renderOnServer($data,int(rand(10000)));
		my $parse2 = from_json($output2);
		$isRandom = ($parse->{text} and $parse2->{text}) ? $parse->{text} ne $parse2->{text}: "";
		$n++;
	} until ($isRandom || $n>10);
	return {is_random=>$isRandom || 0, output=>$output};
}

sub isAltTagMissing {
	my $source = shift;
	my $index;
	$source =~ s/\n//g;
	do {
		$index = index($source,'image(');

		$source = substr $source, $index;
		if($source =~ m/$RE{balanced}{-parens=>'()'}/){
			if (!($1 =~ m/alt/ )){
				return 1;
			}
		}
	} until ($index <1);

	return 0;
}

sub showInBrowser {
		my $file_source = shift;
		die "Could not open file $file_source" unless $file_source;
		my $data = encode_entities $file_source;
		my $output = qx!curl -s -X POST --data-urlencode 'source=$data' -d course=$courseName 
				-d user=$user -d password=$password $hostname/webwork3/renderer!;
		my $parse = from_json($output);

		print "$output\n";

		if($parse->{text}){
			open(my $htmlFile, '>' , '/tmp/test.html') or die "Could not open /tmp/test.html"; 
			print $htmlFile	<<EOF;
<html>
<head>
<script type="text/javascript"
  src="http://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-AMS-MML_HTMLorMML">
</script>
</head>
<body>
<p>
EOF
			print $htmlFile $parse->{text};
 			print $htmlFile	<<XXX;
</p>
</body>
</html>
XXX
# 

			`open /tmp/test.html`; 

	}
}

1;
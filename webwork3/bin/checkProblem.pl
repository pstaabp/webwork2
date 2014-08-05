#!/usr/bin/perl -w

use strict;
use warnings;

use JSON;
use File::Slurp;
use HTML::Entities;
use Getopt::Long;
use Data::Dumper;

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
my $courseName = 'maa101';
my @warnings = ();

GetOptions ('verbose' => \$verbose, 'output:s' => \$outputFile, 'show-errors' => \$showErrors,
		'show-warnings' => \$showWarnings, 'test-randomize' => \$testRandomize,
		'show-in-browser' => \$showInBrowser);

my $results = "";

open(my $fh, '>>', $outputFile) or die "Could not open file '$outputFile' $!";	


if (@ARGV) {
	if($showInBrowser){
		my $file_source = read_file $ARGV[0] || die "Could not open file $ARGV[0]";
		my $data = encode_entities $file_source;
		my $output = qx!curl -s -X POST --data-urlencode 'source=$data' -d course=$courseName localhost/webwork3/renderer!;
		my $parse = from_json($output);

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
			exit 1;
		}
	}
	for my $filename (@ARGV){
		checkFile($filename);			
	}
	if($verbose){
		print "$results";
		print join("\n",@warnings) . "\n" if ($showWarnings);
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
		my $seed1 = int(rand(10000));
		my $seed2 = int(rand(10000));
		$output = qx!curl -s -X POST --data-urlencode 'source=$data' -d seed=$seed1  -d course=$courseName localhost/webwork3/renderer!;
		$parse = from_json($output);
		my $output2 = qx!curl -s -X POST --data-urlencode 'source=$data' -d seed=$seed2  -d course=$courseName localhost/webwork3/renderer!;
		my $parse2 = from_json($output2);
		$isRandom = $parse->{text} ne $parse2->{text};
	} else {
		$output = qx!curl -s -X POST --data-urlencode 'source=$data'  -d course=$courseName  localhost/webwork3/renderer!;
		$parse = from_json($output);
	}

	if($parse->{errors} or $parse->{error}){
		$results .= "0\t $file has errors.\n";
		if($showErrors){
			$results .= ($parse->{errors} || "" ) . ($parse->{error} || "");
		}
	} else {
		$results .= "1\t $file is ok.";
		if($testRandomize){
			$results .= "\trandom: ". ($isRandom || 0 ) . "\n"
		} else {
			$results .= "\n";
		}
	}
	if($showWarnings){
		$results .= $parse->{warnings} if $parse->{warnings};
		for my $key ("debug_messages","warning_messages"){
			my @tmp = map {@$_} @{$parse->{$key}};# flatten the array to a string.
			push(@warnings, @tmp);
		}
	}	
}

sub showHelp {
   print "usage: checkProblem [flags] filename \n\n";
   print "flags: \n";
   print "\t --verbose: \t\t send the output to the commandline as well as the output file.\n";
   print "\t --show-errors: \t print the errors (default: hides the errors)\n";
   print "\t --show-warnings: \t print the errors (default: hides the warnings)\n";
   print "\t --test-randomize: \t tests if the problem has randomization. (default: don't check)\n";
   print "\t --show-in-browser: \t opens the result in a browser.";
   print "\t --output output_file: \t send the output to output_file.  (default: $outputFile)\n";

}

1;
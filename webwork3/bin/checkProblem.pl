#!/usr/bin/perl -w

use strict;
use warnings;

use Moo;
use MooX::Options;
use MooX::Types::MooseLike::Base qw/Str/;

use JSON;
use File::Slurp;
use HTML::Entities;
use Getopt::Long;
use Data::Dump qw/dd dump/;
use Regexp::Common; 
use Carp::Always;

BEGIN {
        die "WEBWORK_ROOT not found in environment.\n"
                unless exists $ENV{WEBWORK_ROOT};
}


option verbose => (is => 'ro', default => "",
    doc => 'send the output to the commandline as well as the output file.');
option output_file => (is => 'ro', format => 's', doc => 'file for ouput');
option show_errors => (is => 'ro' , default => "", 
    doc => 'if denoted, show errors.  Otherwise, ignore them.');
option show_warnings => (is => 'ro' , default => "",
    doc => 'if denoted, show warnings.  Otherwise, ignore them.');
option check_randomize => (is => 'ro', default => "",
    doc => 'tests if the problem has randomization.');
option check_missing_alt_tag => (is => 'ro', default => '',
    doc => 'checks in the pg code if there are any images that are missing alt tags.  ');
option login => (is => 'ro', json => 1, default => sub { return {hostname => 'http://localhost', 
    course_name => 'test',
    user => 'profa',
    password =>  'profa'} });
option file => (is => 'ro', format => 's', doc => 'Path to file to be checked (REQUIRED)', required => 1); 
option output_raw => (is => 'ro', default => '', 
    doc => 'shows the output (as JSON) from the renderer.');
option show_in_browser => (is => 'ro', default => '',
    doc => 'opens the result in a browser.');

has results => (is => 'rw', type=> Str);
has problem => (is => 'rw', type=> [Models::Library::Problem]);



my $WW_ROOT = $ENV{WEBWORK_ROOT};
my @warnings = ();


my $FH; 
my $outputFile = $WW_ROOT . "/webwork3/environments/logs/check_library_output.txt";

sub run {
    my $self  = shift; 
    
    $self->results("");
    
    my $out = $self->loginToServer;

    my $session = from_json($out);
    if(!$session->{logged_in}){
        die "You were not able to log in.  Please check the credentials.";
    }
    
    self->problem(new Model::Library::Problem(path=> '');

    open($FH, '>', $outputFile) or die "Could not open file '$outputFile' $!";	

    ## auto flush printing
    $| = 1; 
    
    if($self->file){
        $self->checkFile;
    }
    
    print $FH $self->results;
    if($self->{show_warnings} and scalar(@warnings)>0){
        print $FH join("\n", @warnings) . "\n";
    }
    
    close($FH);
    
}


sub checkFile {
    my $self = shift;
	my $file_source = read_file $self->file || die "Could not open file: " . $self->file . "\n"; 
	my $data = encode_entities $file_source;
	my $output;
	my $parse; 
	my $isRandom; 
    
	if($self->check_randomize){
		$isRandom = $self->checkForRandomize($data)->{is_random};
	} else {
		$output = $self->renderOnServer($data);
        $parse = from_json($output);
		# print "$output\n";
	}
    
	if($parse->{errors} or $parse->{error}){
        my $file = $self->file;
		$self->printResults("0\t $file has errors.");
		if($self->show_errors){
			$self->printResults(($parse->{errors} || "" ) . ($parse->{error} || ""));
		}
	} else {
		$self->printResults("1\t" . $self->file . " is ok.");
		if($self->check_randomize){
			$self->printResults("\trandom: ". ($isRandom || 0 ));
		} 
	}
	if($self->show_warnings){
		$self->results($self->results . $parse->{warnings}) if $parse->{warnings};
		for my $key ("debug_messages","warning_messages"){
			my @tmp = map {@$_} @{$parse->{$key}};# flatten the array to a string.
			push(@warnings, @tmp);
		}
	}	
	if($self->check_missing_alt_tag){
		$self->printResults("\t\tmissing alt tag: ". isAltTagMissing($file_source));
	}

	$self->printResults("\n");

	if($self->raw_output and $self->verbose){
		$self->printResults(Dumper($parse));
	}
	return $parse;
}

# this logs into the server to start a session and then a cookie is stored. 

sub loginToServer {
	my $self = shift; 
    
	my $hostname = $self->login->{hostname};
	my $user = $self->login->{user};
	my $password = $self->login->{password};
	my $courseName = $self->login->{course_name};
	my $flags = "-s -c /tmp/dancer-cookies -X POST -d user=$user -d password=$password ";
    
	return qx!curl $flags $hostname/webwork3/courses/$courseName/login!;
}

sub renderOnServer {
	my ($self,$data,$seed) = @_;
	my $hostname = $self->login->{hostname};
	my $courseName = $self->login->{course_name};
	my $flags = "-s -b /tmp/dancer-cookies -X POST --data-urlencode 'source=$data' -d course_id=$courseName " . 
					 (defined($seed) ? "-d seed=$seed" : "");
                     
    #dd qq!curl $flags $hostname/webwork3/renderer!;
	return qx!curl $flags $hostname/webwork3/renderer!;
}

sub printResults {
    my ($self,$results) = @_;
	print $FH $results;
	print $results if $self->verbose;
}

sub checkForRandomize {
	my ($self,$data) = @_;
	my $isRandom = "";
	my $n=0;
	my $output = $self->renderOnServer($data,int(rand(10000)));
	my $parse = from_json($output);
	do {
		my $output2 = $self->renderOnServer($data,int(rand(10000)));
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
		my $parse = checkFile($file_source);

		if($parse->{text}){
			open(my $htmlFile, '>' , '/tmp/test.html') or die "Could not open /tmp/test.html"; 
			print $htmlFile	<<XXX;
<html>
<head>
<script type="text/javascript"
  src="http://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-AMS-MML_HTMLorMML">
</script>
</head>
<body>
<div style='border: 1px solid black; border-radius:5px'>
XXX
			print $htmlFile $parse->{text};
 			print $htmlFile	<<XXX;
</div>
<div style='border: 1px solid black; border-radius:5px'>
<textarea rows=40 cols=120>
XXX
			my $output = read_file($file_source);
			#$output =~ s/\n/<br>/g;
			print $htmlFile $output;
			print $htmlFile <<XXX;
</textarea>
</div>
</body>
</html>
XXX
			close $htmlFile;

			print $parse->{text};
# 

			`open /tmp/test.html`; 

	}
}

main->new_with_options->run;

1;

#!/usr/bin/perl -w

use JSON;
use File::Slurp;
use Data::Dumper;

if (@ARGV) {
	my $file_source = read_file $ARGV[0] || die "Could not open file $file";
	my $data = to_json({source=>$file_source});

	print Dumper($data);

	my $parsedData = from_json($data);

	print Dumper($parsedData->{source});

	my $output = qx!curl -s -X POST -H 'Content-Type: application/json' -d '$data' localhost/webwork3/renderer!;
	print $output;

	die "stop";
	my $parse = from_json($output);
	my @errors = ();
	for my $key ("warnings","errors"){
		push(@errors,$parse->{$key});
	}	
	for my $key ("debug_messages","warning_messages"){
		push(@errors, join($parse->{$key},''));  # flatten the array to a string.
	}
	@errors = grep { $_ ne '' } @errors; 

	if(scalar(@errors) == 0){
		print "1\t $file is ok.\n";
	} else {
		my $result = {};
		for my $key ("warnings","errors"){
			$result->{$key} = $parse->{$key};
		}
		for my $key ("debug_messages","warning_messages"){
			$result->{$key} = join($parse->{$key},'');
		}
		print "1\t $file has errors.\n";
	}
		
} else {

}
1;
#!/usr/bin/perl -w

use JSON;

use Data::Dumper;

if (@ARGV) {
	print "running script \n";
	my $file = $ARGV[0];
	print "$file \n";
	my $output = `curl -s -X POST -d 'file=$file' localhost/webwork3/renderer`;
	my $parse = from_json($output);
	my @errors = ();
	for my $key ("warnings","errors"){
		push(@errors,$parse->{$key});
	}	
	for my $key ("debug_messages","warning_messages"){
		push(@errors, join($parse->{$key},''));  # flatten the array to a string.
	}
	@errors = grep { $_ ne '' } @errors; 

	print Dumper(@errors);

	if(scalar(@errors) == 0){
		print "yeah!!\n";
	} else {
		my $result = {};
		for my $key ("warnings","errors"){
			$result->{$key} = $parse->{$key};
		}
		for my $key ("debug_messages","warning_messages"){
			$result->{$key} = join($parse->{$key},'');
		}
		print "output=" . Dumper($result) . "\n";	
	}
		
} else {

}
1;


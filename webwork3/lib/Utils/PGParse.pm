package Utils::PGParse;

## this file parses a PG file 
##
# input: a file path to a pg file
# output: a LibraryProblem object containing tag data and other information about the file

use Moo;
use MooX::Types::MooseLike::Base qw(Str InstanceOf);
use Data::Dump qw/dd/;
use List::MoreUtils qw/any first_index uniq/;
use Path::Class;
use Text::Balanced qw/extract_bracketed extract_delimited/; 
use feature 'say';

require Models::Library::Problem;
use Models::Library::TextbookProblem;
use Models::Library::DBinfo;

has library_dir => (is => 'rw', isa => Str, required => 1);
has problem_path => (is=>'rw', isa => Str, required => 1);
has problem => (is => 'rw', isa => InstanceOf['Models::Library::Problem']);

my @basic_tags = qw/DBsubject DBchapter DBsection Institution Date Author Email MLT MLTleader KEYWORDS Level Language Static MO Status/;
my @numbered_tags = qw/TitleText AuthorText EditionText Section Problem/;
my $tb_links; 
my $chapterSectionREGEX = qr{^(\d+)(\.(\d+))?$};
my $integerREGEX = qr{^\s*(-?\d+)\s*$};

sub parse {
    my $self = shift; 
  
    my $relPath = file($self->problem_path)->relative(dir($self->library_dir));
    #say $relPath;
    $self->problem(Models::Library::Problem->new(path=>$relPath->stringify)); 

    $self->parseTags();
    $self->problem->statement($self->parseStateOrSolution("statement"));
    $self->problem->solution($self->parseStateOrSolution("solution"));
    
    return $self->problem;
}



sub parseTags {
    my $self = shift; 
  
    my $docregex = qr{DOCUMENT()};
    my $tagregex = qr{^\s*\#+\s*([a-zA-Z]+)\((.*)\)\s*$};
    my $ntagregex = qr{^\s*\#+\s*([a-zA-Z]+)(\d)\((.*)\)\s*$};
    my $quoteMatchregex = qr{^'(.*)'$};
    my $splitLastSpaceregex = qr{\s([^\s]+)$};
    my @textProblemInfo = ();  # store the information for each textbook problem tag
    my $author_info = {};
    my $db_info = {};
    my @matches2;
    my $FILE;
    open $FILE, $self->problem_path or die "Could not open $FILE: $!";
    while(my $line = <$FILE>)  {
        if(my @matches = $line =~ /$tagregex/i){
            my $tag = $matches[0];
            # check for matching the basic tag
            $tag =~ s/\\/\\\\/g;
            my $match = any { $_ =~ /$tag/i } @basic_tags;
            if ($match){
                my $value;  # check if the tag is wrapped in quotes
                if( !($tag =~ /KEYWORDS/i)){
                    if(@matches2 = $matches[1] =~ $quoteMatchregex){ 
                        $value = $matches2[0];
                    } else {
                        $value = $matches[1];
                    }
                } else {
                    $value = $matches[1];
                }

                if($tag eq "DBsubject"){      $db_info->{DBsubject} = $value; }
                elsif($tag eq "DBchapter"){   $db_info->{DBchapter} = $value; }
                elsif($tag eq "DBsection"){   $db_info->{DBsection} = $value; }
                elsif($tag eq "Institution"){ $author_info->{institution} = $value;}
                elsif($tag eq "Date"){        $self->problem->date($value);}
                elsif($tag eq "Email"){       $author_info->{email} = $value;}
                elsif($tag eq "Author"){     # split the problem author into first and last names
                    my @els = split($splitLastSpaceregex, $value);
                    $author_info->{lastname} = $els[1] if $els[1];
                    $author_info->{firstname} = $els[0] if $els[0]; }
                elsif($tag eq "MLT"){         $self->problem->mlt($value);}
                elsif($tag eq "MLTleader"){   $self->problem->mlt_leader($value);}
                elsif($tag eq "Level"){       $self->problem->level($value);}
                elsif($tag eq "MO"){          $self->problem->MO($value);}
                elsif($tag eq "KEYWORDS"){
                    my @keywords = $value =~ m/'([^']+)'/g;
                    
                   # say "KEYWORDS";
                    
                    my @kws = ();
                    # this is needed for badly nested commas/quotes
                    for my $keyword (@keywords) {
                        push(@kws,split(",",$keyword));
                    }
                    
                    # make everything lower case and then avoid duplicates. 
                    
                    @kws = uniq map {$_ = lc($_); $_ } @kws;
                    
                    @keywords = ();
                    
                    for my $kw (@kws){
                        if (my @trim = $kw =~ /^\s*(.*)\s*$/){
                            if(!($trim[0] =~ /^$/)){
                                push(@keywords,$trim[0]);
                            }
                        }
                    }
                    #@kws = grep { $_ =~ /^\w/ } 
                    
                    #dd \@kws;
                    
                    $self->problem->keywords([@keywords]);
                }
            }
      # check for matching a numbered tag
        } elsif(@matches = $line =~ /$ntagregex/i){
            my $tag = $matches[0];
            my $match = any { $_ =~ /$tag/i } @numbered_tags;
            if ($match){
                my $number = $matches[1];
                my $value;  # check if the tag is wrapped in quotes
                if(@matches2 = $matches[2] =~ $quoteMatchregex){ 
                    $value = $matches2[0];
                } else {
                    $value = $matches[2];
                }
          
                if (scalar(@textProblemInfo) < $number) {
                    my $info = {'TitleText'=>"",'AuthorText'=>"",'EditionText'=>"",'Section'=>"",'Problem'=>""};
                    push(@textProblemInfo,$info);
            
                } 
                if($tag eq 'EditionText'){
                    if(my @numMatch = $value =~ /$integerREGEX/){
                        $textProblemInfo[$number-1]{$tag}=$numMatch[0];  
                        #dd "I matched";
                        #dd @numMatch;
                        #dd $textProblemInfo[$number-1];
                    }
                } else {
                    $textProblemInfo[$number-1]{$tag}=$value;
                }
            }
        }
    }
    
    $self->problem->keywords([]) unless $self->problem->keywords; ## make sure that the keywords is an array, empty if needed. 
    
    # This parses the textbook information
    my @tmp = map { parseTextbook($_) } @textProblemInfo;
    @tmp = grep { defined($_) } @tmp;
    
    #dd "These are the textbooks";
    #dd @tmp;
    
    my $info = {}; # { %$author_info };
    
    for my $key (keys(%$author_info)){
        $info->{$key} = $author_info->{$key} if defined($author_info->{$key});
    }
    $self->problem->problem_author(Models::Library::ProblemAuthor->new($info));
    my $DBinfo = Models::Library::DBinfo->new($db_info);
    $self->problem->DBinfo($DBinfo);
    $self->problem->textbookProblems(\@tmp);
    
    close $FILE;
}


sub parseStateOrSolution {
    my ($self,$st_or_soln) = @_; 
    my $statement = "";
    my $found = "";
    my $inclPGregex = qr{includePGproblem};
    my $FILE;
    my $line;
    
    my $startRE = ($st_or_soln eq "statement") ? qr/^\s*(TEXT\(EV2\(\<\<EOT\)\));\s*$|^\s*BEGIN_TEXT\s*$/i :
                qr/SOLUTION/i; 
    my $stopRE = qr/^EOT|EOF|END_TEXT|ENDDOCUMENT|END_SOLUTION/i;
    
    
    open $FILE, $self->problem_path or die "Could not open $FILE: $!";
    while($line = <$FILE>)  {
        if ($line =~ $inclPGregex){
          $self->problem->isLink(1);
        } elsif (my @matches = $line =~ $startRE ){
          last;
        }
    }
    while(<$FILE>)  {
        chomp(my $line = $_);
        if ($line =~ $stopRE){
            last;
        } else {
            $statement .= $line . " " ;
        }
    }
    close $FILE;
    
    return removeMath($statement);
    
}

sub removeMath {
    my $input = shift;
    
    $input =~ s/\\\{.*?\\\}//g;  ## remove everything between \{ and \} 
    $input =~ s/\\\(.*?\\\)//g; ## remove everything between \( and \) 
    $input =~ s/\\\[.*?\\\]//g;  ## remove everything between \[ and \] 
    $input =~ s/\$[a-zA-z]\w*//g;  ## remove $VARIABES  
    $input =~ s/\$\{B(\w+)\}(.*?)\$\{E\1\}/$2/g;  # remove things like ${BBOLD} and {$EBOLD}
    $input =~ s/\s+/ /g;  ## remove extra white space. 

    return $input
}

sub parseTextbook {
    my $textbook = shift; 
    my $tp = {};
    
    $tp->{author} = $textbook->{AuthorText} if $textbook->{AuthorText};
    $tp->{title} = $textbook->{TitleText} if $textbook->{TitleText};
    $tp->{edition} = $textbook->{EditionText} if $textbook->{EditionText};

    my $ind = first_index { 
        $_->{author} eq $tp->{author} && $_->{title} eq $tp->{title} && $_->{edition} eq $tp->{edition} 
    } @{$tb_links->{textbooks}};
    
    
    if($ind>-1){
        if(my @matches = $textbook->{Section} =~ $chapterSectionREGEX){
            #dd @matches; 
            my $sections = $tb_links->{textbooks}[$ind]->{sections};
            my $ch_index = first_index { $_->{section} eq $matches[0] } @$sections;
            my $ch_name = ${$sections}[$ch_index]->{name};
            my $sect_index = first_index {$_->{section} eq $textbook->{Section}} @$sections;
            my $sect_name = ${$sections}[$sect_index]->{name} if $sect_index >=0; 
            $tp->{chapter_number} = $matches[0]; 
            $tp->{chapter} = $ch_name;
            $tp->{section_number} = $sect_index if $sect_index > -1;
            $tp->{section} = $sect_name if $sect_index > -1;
            
            if($sect_index < 0) {
                print "\nERROR:  the section number " . $textbook->{Section} . " doesn't exist for the textbook  \n";
                print "author: " . $tp->{author} . " and edition " . $tp->{edition} . " for file\n";
            }
        } else {
            print "\nERROR:  the section number " . $textbook->{Section} . " doesn't exist for the textbook  \n";
            print "author: " . $tp->{author} . " and edition " . $tp->{edition} . " for file\n";
         
        }
        
    } else {
        $tp->{section} = $textbook->{Section};
    }
    my @probs = split(qr{\s+},$textbook->{Problem});
    $tp->{problem} = \@probs;
    
    return ($ind>-1) ?  Models::Library::TextbookProblem->new($tp) : undef;
        
}

1;
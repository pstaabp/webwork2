package Utils::PGParse;

## this file parses a PG file 
##
# input: a file path to a pg file
# output: a LibraryProblem object containing tag data and other information about the file


use Data::Dump qw/dd/;
use List::MoreUtils qw/any first_index/;

require Models::Library::Problem;
use Models::Library::TextbookProblem;
use Models::Library::DBinfo;

my @basic_tags = qw/DBsubject DBchapter DBsection Institution Date Author Email MLT MLTleader KEYWORDS Level Language Static MO Status/;
my @numbered_tags = qw/TitleText AuthorText EditionText Section Problem/;
my $tb_links; 
my $chapterSectionREGEX = qr{^(\d+)(\.(\d+))?$};

sub parse {
  my $filepath = shift;
  $tb_links = shift;
  
  my $prob = Models::Library::Problem->new(path=>$filepath);
  open my $file, $filepath or die "Could not open $file: $!";
  parseTags($file,$prob);
  close $file;
    
  open my $file, $filepath or die "Could not open $file: $!";
  $prob->statement(parseStatement($file,$prob));
  close $file;
  
  
  
  return $prob;

}



sub parseTags {
    my ($file,$prob) = @_;
  
    my $docregex = qr{DOCUMENT()};
    my $tagregex = qr{^\s*\#+\s*([a-zA-Z]+)\((.*)\)\s*$};
    my $ntagregex = qr{^\s*\#+\s*([a-zA-Z]+)(\d)\((.*)\)\s*$};
    my $quoteMatchregex = qr{^'(.*)'$};
    my $splitLastSpaceregex = qr{\s([^\s]+)$};
    my @textProblemInfo = ();  # store the information for each textbook problem tag
    my $author_info = {};
    my $db_info = {};
    while(my $line = <$file>)  {
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
                elsif($tag eq "Date"){        $prob->date($value);}
                elsif($tag eq "Email"){       $author_info->{email} = $value;}
                elsif($tag eq "Author"){     # split the problem author into first and last names
                    my @els = split($splitLastSpaceregex, $value);
                    $author_info->{lastname} = $els[1] if $els[1];
                    $author_info->{firstname} = $els[0] if $els[0]; }
                elsif($tag eq "MLT"){         $prob->mlt($value);}
                elsif($tag eq "MLTleader"){   $prob->mlt_leader($value);}
                elsif($tag eq "Level"){       $prob->level($value);}
                elsif($tag eq "MO"){          $prob->MO($value);}
                elsif($tag eq "KEYWORDS"){
                    my @keywords = $value =~ m/'([^']+)'/g;
                    my @kws = ();
                    # this is needed for badly nested commas/quotes
                    for my $keyword (@keywords) {
                        push(@kws,split(",",$keyword));
                    }
                    $prob->keywords([@kws]);
                }
            }
      # check for matching a numbered tag
        } elsif(my @matches = $line =~ /$ntagregex/i){
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
                $textProblemInfo[$number-1]{$tag}=$value;
            }
        }
        
    }
    
    $prob->keywords([]) unless $prob->keywords; ## make sure that the keywords is an array, empty if needed. 
    
    # This parses the textbook information
    my @tmp = map { parseTextbook($_) } @textProblemInfo;

    my $info = {}; # { %$author_info };
    
    for my $key (keys(%$author_info)){
        $info->{$key} = $author_info->{$key} if defined($author_info->{$key});
    }
    $prob->problem_author(Models::Library::ProblemAuthor->new($info));
    my $DBinfo = Models::Library::DBinfo->new($db_info);
    $prob->DBinfo($DBinfo);
    $prob->textbookProblems(\@tmp);
    
    
}



sub parseStatement {
    my ($file,$prob) = @_;
    my $statement = "";
    my $found = "";
    my $inclPGregex = qr{includePGproblem};
    while(my $line = <$file>)  {
        if ($line =~ $inclPGregex){
          $prob->isLink(1);
        } elsif (my @matches = $line =~ /^\s*(TEXT\(EV2\(<<EOT\)\));\s*$|^\s*BEGIN_TEXT\s*$/i ){
          last;
        }
    }
    while(my $line = <$file>)  {
        if ($line =~ /EOT|END_TEXT/i){
            return $statement;
        } else {
            $statement .= $line;
        }
    }
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
            my $sections = $tb_links->{textbooks}[$ind]->{sections};
            my $ch_index = first_index { $_->{section} eq $matches[0] } @$sections;
            my $ch_name = ${$sections}[$ch_index]->{name};
            my $sect_index = first_index {$_->{section} eq $textbook->{Section}} @$sections;
            my $sect_name = ${$sections}[$sect_index]->{name} if $sect_index >=0; 
            $tp->{chapter_number} = $ch_index; 
            $tp->{chapter} = $ch_name;
            $tp->{section_number} = $sect_index;
            $tp->{section} = $sect_name; 

        } 
    } else {
        $tp->{section} = $_->{Section};
    }
    $tp->{problem} = $_->{Problem} if $_->{Problem};

    Models::Library::TextbookProblem->new($tp);


}

1;
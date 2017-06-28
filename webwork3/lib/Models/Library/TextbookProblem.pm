####
#
#  This is base class for a Textbook Problem in the OPL library.
#
#  The information in this class is the information in the numbered textbook info tags in a PG problem.
#
####

package Models::Library::TextbookProblem;
use Moo;
use Types::Standard qw(Int ArrayRef);

use Data::Dump qw/dd/;

use Models::Library::Schema;


has textbook_id => (is=>'rw');
has title => (is=>'rw',required=>1,default=>sub{""});
has edition => (is=>'rw',required=>1,default=>sub{0});
has author => (is=>'rw');
has publisher => (is=>'rw');
has isbn => (is=>'rw');
has pubdate => (is=>'rw');
has chapter => (is=>'rw',default=>'');
has chapter_number => (is=>'rw');
has section => (is=>'rw',default=>'');
has section_number => (is=>'rw');
has problem => (is=>'rw',default=>'',isa => ArrayRef[Int]);
has page => (is=>'rw');

## insert Textbook info in the database;
sub insert {
    my $self = shift;
    my $pgfile_id = shift; # this is the Library Problem pgfile_id

    my $textbook_info = {};
    $textbook_info->{title} = $self->title if $self->title;
    $textbook_info->{author} = $self->author if $self->author;
    $textbook_info->{edition} = $self->edition if $self->edition;
    $textbook_info->{publisher} = $self->publisher if $self->publisher;
    $textbook_info->{isbn} = $self->isbn if $self->isbn;
    $textbook_info->{pubdate} = $self->pubdate if $self->pubdate;

    my $text = Models::Library::Textbook->find($textbook_info);

    #dd $self;
    # add it to the database unless it already exists.
    my $textbook_id = $text->{textbook_id} ||  Models::Library::Textbook->insert($textbook_info);


    my $chapter_info = {};
    $chapter_info->{textbook_id} = $textbook_id;
    $chapter_info->{number} = $self->chapter_number if $self->chapter_number;
    $chapter_info->{name} = $self->chapter if $self->chapter;

#    dd "chapter_info line 58 Textbook problem";
#    dd $chapter_info;
#    dd $self;
    if($chapter_info->{name}) {
        my $chapter = Models::Library::Chapter->find($chapter_info);
        my $chapter_id = $chapter->{chapter_id} || Models::Library::Chapter->insert($chapter_info);

        my $section_info = {};
        $section_info->{chapter_id} = $chapter_id;
        $section_info->{number} = $self->section_number if $self->section_number;
        $section_info->{name} = $self->section if $self->section;
        $section_info->{page} = $self->page if $self->page;

        my $section = Models::Library::Section->find($section_info);
        my $section_id = $section->{section_id} || Models::Library::Section->insert($section_info);

        if(defined($self->problem) && $self->problem ne "") {


            for my $prob (@{$self->problem}){
                my $problem_info = {};
                $problem_info->{section_id} = $section_id;
                $problem_info->{number} = $prob;
                $problem_info->{page} = $self->page if $self->page;
                my $problem = Models::Library::ProblemInfo->find($problem_info);
                my $problem_id = $problem->{problem_id} || Models::Library::ProblemInfo->insert($problem_info);

                # this is the connection between the problem_is and the pgfile_id
                my $pgfile_problem = Models::Library::PGFileProblem->find({problem_id=>$problem_id,pgfile_id=>$pgfile_id});
                Models::Library::PGFileProblem->insert({problem_id=>$problem_id,pgfile_id=>$pgfile_id}) unless $pgfile_problem;
            }
        }
    }

}

sub toString {
  my $self = shift;
  my $str = "\t{\n";
  $str .= $self->title ?  "\t\t title=> " . $self->title . ", \n" : "";
  $str .= $self->edition ?  "\t\t edition=> " . $self->edition . ", \n" : "";
  $str .= $self->author ?  "\t\t author=> " . $self->author . ", \n" : "";
  $str .= $self->publisher ?  "\t\t publisher=> " . $self->publisher . ", \n" : "";
  $str .= $self->isbn ?  "\t\t isbn=> " . $self->publisher . ", \n" : "";
  $str .= $self->pubdate ?  "\t\t pubdate=> " . $self->pubdate . ", \n" : "";
  $str .= $self->chapter ?  "\t\t chapter=> " . $self->chapter . ", \n" : "";
  $str .= $self->section ?  "\t\t section=> " . $self->section . ", \n" : "";
  $str .= $self->problem ?  "\t\t problem=> " . $self->problem . ", \n" : "";
  $str .= "\t}\n";

}


1;

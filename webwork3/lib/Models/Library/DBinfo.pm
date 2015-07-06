package Models::Library::DBinfo;
use Moo;
use MooX::Types::MooseLike::Base qw(Str);

use namespace::clean;
use Data::Dump qw/dd/;

has DBsubject => (is=>'rw',isa => Str,default =>"");
has DBchapter => (is=>'rw',isa => Str,default =>"");
has DBsection => (is=>'rw',isa => Str,default =>"");

sub insert {
    my $self = shift; 
    
    my $DBsubject = Library::DBsubject->find({name=>$self->DBsubject});
    my $DBsubject_id = $DBsubject->{DBsubject_id} || Library::DBsubject->insert({name=>$self->DBsubject});

    my $DBchapter = Library::DBchapter->find({name=>$self->DBchapter, DBsubject_id=>$DBsubject_id});
    my $DBchapter_id = $DBchapter->{DBchapter_id} 
        || Library::DBchapter->insert({name=>$self->DBchapter, DBsubject_id=>$DBsubject_id});
    my $DBsection = Library::DBsection->find({name=>$self->DBsection, DBchapter_id=>$DBchapter_id});
    my $DBsection_id = $DBsection->{DBsection_id} 
        || Library::DBsection->insert({name=>$self->DBsection, DBchapter_id=>$DBchapter_id});

    return $DBsection_id; 
    
}
 sub toString {
    my $self = shift;
    return dd($self);
}


1;
package Models::Library::DBinfo;
use Moo;
use Types::Standard qw(Str);

use namespace::clean;
use Data::Dump qw/dd/;

has DBsubject => (is=>'ro',isa => Str,default =>"");
has DBchapter => (is=>'ro',isa => Str,default =>"");
has DBsection => (is=>'ro',isa => Str,default =>"");

sub insert {
    my $self = shift;

    my $DBsubject = Models::Library::DBsubject->find({name=>$self->DBsubject});
    my $DBsubject_id = $DBsubject->{DBsubject_id} || Models::Library::DBsubject->insert({name=>$self->DBsubject});

    my $DBchapter = Models::Library::DBchapter->find({name=>$self->DBchapter, DBsubject_id=>$DBsubject_id});
    my $DBchapter_id = $DBchapter->{DBchapter_id}
        || Models::Library::DBchapter->insert({name=>$self->DBchapter, DBsubject_id=>$DBsubject_id});
    my $DBsection = Models::Library::DBsection->find({name=>$self->DBsection, DBchapter_id=>$DBchapter_id});
    my $DBsection_id = $DBsection->{DBsection_id}
        || Models::Library::DBsection->insert({name=>$self->DBsection, DBchapter_id=>$DBchapter_id});

    return $DBsection_id;

}
 sub toString {
    my $self = shift;
    return dd($self);
}


1;

package Models::Library::PGFile;
use Moo;
use MooX::Types::MooseLike::Base qw(Int Str);

use namespace::clean;
use Data::Dump qw/dd/;

with 'DBIx::Mint::Table';
has DBsection_id => (is=>'rw',isa => Int);
has author_id => (is=>'rw',isa => Int);
has path_id => (is=>'rw',isa => Int);
has institution => (is=>'rw',isa => Str);
has filename => (is=>'rw',isa => Str);
has level => (is=>'rw',isa => Int);
has static => (is=>'rw',isa => Str);
has MO => (is=>'rw',isa => Str);



sub insertDB {
    my $self = shift; 
        
    my $info = {};
    $info->{DBsection_id} = $self->DBsection_id if $self->DBsection_id;
    $info->{author_id} = $self->author_id if $self->author_id;
    $info->{path_id} = $self->path_id if $self->path_id;
    $info->{institution} = $self->institution if $self->institution;
    $info->{filename} = $self->filename if $self->filename;
    $info->{level} = $self->level if $self->level;
    $info->{static} = $self->static if $self->static;
    $info->{MO} = $self->MO if $self->MO;
    
    my $pgfile = Models::Library::Textbook->find($info);
    
    # add it to the database unless it already exists. 
    return $pgfile->{pgfile_id} ||  Models::Library::Textbook->insert($info);  
    
}


1;
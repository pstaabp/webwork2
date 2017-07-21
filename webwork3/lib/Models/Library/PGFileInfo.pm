###
#
#  This is a Moo object version of a Library Problem Info.
#
#  this only has the pgfile_id and the file_path of a file.  It is intended
#  to represent a problem from the Library.
#
###


package Models::Library::PGFileInfo;
use feature 'say';
use Moo;
use Types::Standard qw/Str Int/;

use Data::Dump qw/dump dd/;

has source_file => (is => 'ro', isa => Str, required=>1);
has pgfile_id => (is=>'ro', isa => Int, required => 1);

sub TO_JSON { return { %{ shift() } }; }

1;

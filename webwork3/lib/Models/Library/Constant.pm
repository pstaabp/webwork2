package Models::Library::Constant;

use base 'Exporter';

our @EXPORT = qw();
our @EXPORT_OK = qw( $DBTYPE $MONGOclient );



our $DBTYPE = 'MYSQL';
our $MONGOclient = '';

1;
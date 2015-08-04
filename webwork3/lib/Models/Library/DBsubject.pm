package Models::Library::DBsubject;

use Moo;
with 'DBIx::Mint::Table';

has DBsubject_id => (is=>'rw',default=>"");
has name => (is=>'rw',default=>"");


package Models::Library::DBchapter;
use Moo;
with 'DBIx::Mint::Table';

has DBchapter_id => (is=>'rw',default=>"");
has name => (is=>'rw',default=>"");
has DBsubject_id => (is=>'rw',default=>"");


package Models::Library::DBsection;
use Moo;
with 'DBIx::Mint::Table';

has DBsection_id => (is=>'rw',default=>"");
has name => (is=>'rw',default=>"");
has DBchapter_id => (is=>'rw',default=>"");


package Models::Library::Textbook;
use Moo;
with 'DBIx::Mint::Table';
has textbook_id => (is=>'rw',default=>'');
has title => (is=>'rw',default=>'');
has edition => (is=>'rw',default=>0);
has author => (is=>'rw',default=>'');
has publisher => (is=>'rw',default=>'');
has isbn => (is=>'rw',default=>'');
has pubdate => (is=>'rw',default=>'');



package Models::Library::Chapter;
use Moo;
with 'DBIx::Mint::Table';
has chapter_id => (is=>'rw');
has textbook_id => (is=>'rw');
has number => (is=>'rw');
has name => (is=>'rw');

package Models::Library::Section;
use Moo;
with 'DBIx::Mint::Table';
has section_id => (is=>'rw',default=>'');
has chapter_id => (is=>'rw',default=>'');
has number => (is=>'rw',default=>-1);
has name => (is=>'rw',default=>'');
has page => (is=>'rw',default=>'');

package Models::Library::ProblemInfo;
use Moo;
with 'DBIx::Mint::Table';
has problem_id => (is=>'rw');
has section_id => (is=>'rw',default=>'');
has number => (is=>'rw',default=>-1);
has page => (is=>'rw',default=>'');


package Models::Library::Keyword;
use Moo;
with 'DBIx::Mint::Table';
has keyword_id => (is=>'rw');
has keyword => (is=>'rw');

package Models::Library::Path;
use Moo;
with 'DBIx::Mint::Table';
has path_id => (is=>'rw');
has path => (is=>'rw');
has machine => (is=>'rw');
has user => (is=>'rw');

package Models::Library::PGFile;
use Moo;
with 'DBIx::Mint::Table';
has pgfile_id => (is=>'rw');
has DBsection_id => (is=>'rw');
has author_id => (is=>'rw');
has institution => (is=>'rw');
has path_id => (is=>'rw');
has filename => (is=>'rw');
has morelt_id => (is=>'rw');
has level => (is=>'rw');
has language => (is => 'rw');
has static => (is=>'rw');
has MO => (is=>'rw');

package Models::Library::MoreLT;
use Moo;
with 'DBIx::Mint::Table';
has morelt_id => (is=>'rw');
has name => (is=>'rw');
has DBsection_id => (is=>'rw');
has leader => (is=>'rw');

package Models::Library::PGFileProblem;
use Moo;
with 'DBIx::Mint::Table';
has pgfile_id => (is=>'rw');
has problem_id => (is=>'rw');

package Models::Library::PGFileKeyword;
use Moo;
with 'DBIx::Mint::Table';
has pgfile_id => (is=>'rw');
has keyword_id => (is=>'rw');


1;
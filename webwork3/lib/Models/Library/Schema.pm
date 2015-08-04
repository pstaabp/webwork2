package Models::Library::Schema;

use DBIx::Mint;
use strict;
use warnings;

my $s = DBIx::Mint->instance->schema;

### Class definitions

$s->add_class(
    class   => 'Models::Library::DBsubject',
    table   => 'OPL_DBsubject',
    pk      => 'DBsubject_id',
    auto_pk => 1
);

$s->add_class(
    class   => 'Models::Library::DBchapter',
    table   => 'OPL_DBchapter',
    pk      => 'DBchapter_id',
    auto_pk => 1
);

$s->add_class(
    class   => 'Models::Library::DBsection',
    table   => 'OPL_DBsection',
    pk      => 'DBsection_id',
    auto_pk => 1
);

$s->add_class(
    class   => 'Models::Library::ProblemAuthor',
    table   => 'OPL_author',
    pk      => 'author_id',
    auto_pk => 1
);

$s->add_class(
    class   => 'Models::Library::Textbook',
    table   => 'OPL_textbook',
    pk      => 'textbook_id',
    auto_pk => 1
);

$s->add_class(
    class   => 'Models::Library::Chapter',
    table   => 'OPL_chapter',
    pk      => 'chapter_id',
    auto_pk => 1
);

$s->add_class(
    class   => 'Models::Library::Section',
    table   => 'OPL_section',
    pk      => 'section_id',
    auto_pk => 1
);

$s->add_class(
    class   => 'Models::Library::ProblemInfo',
    table   => 'OPL_problem',
    pk      => 'problem_id',
    auto_pk => 1
);

$s->add_class(
    class   => 'Models::Library::Keyword',
    table   => 'OPL_keyword',
    pk      => 'keyword_id',
    auto_pk => 1
);

$s->add_class(
    class   => 'Models::Library::Path',
    table   => 'OPL_path',
    pk      => 'path_id',
    auto_pk => 1
);

$s->add_class(
    class   => 'Models::Library::PGFile',
    table   => 'OPL_pgfile',
    pk      => 'pgfile_id',
    auto_pk => 1
);

$s->add_class(
    class   => 'Models::Library::MoreLT',
    table   => 'OPL_morelt',
    pk      => 'morelt_id',
    auto_pk => 1
);

$s->add_class(
    class   => 'Models::Library::PGFileProblem',
    table   => 'OPL_pgfile_problem',
    pk      => ['pgfile_id','problem_id'],
);

$s->add_class(
    class   => 'Models::Library::PGFileKeyword',
    table   => 'OPL_pgfile_keyword',
    pk      => ['pgfile_id','keyword_id'],
);



1;
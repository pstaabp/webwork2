CREATE TABLE OPL_DBsubject (
    DBsubject_id int(15) NOT NULL auto_increment,
	name varchar(127) NOT NULL,
	KEY DBsubject (name),
	PRIMARY KEY (DBsubject_id));

CREATE TABLE OPL_DBchapter (
    DBchapter_id int(15) NOT NULL auto_increment,
	name varchar(127) NOT NULL,
	DBsubject_id int(15) DEFAULT 0 NOT NULL,
	KEY DBchapter (name),
	KEY (DBsubject_id),
	PRIMARY KEY (DBchapter_id)
    );

CREATE TABLE OPL_DBsection (
    DBsection_id int(15) NOT NULL auto_increment,
	name varchar(255) NOT NULL,
	DBchapter_id int(15) DEFAULT 0 NOT NULL,
	KEY DBsection (name),
	KEY (DBchapter_id),
	PRIMARY KEY (DBsection_id)
    );

CREATE TABLE OPL_author (
    author_id int (15) NOT NULL auto_increment,
	institution tinyblob,
	lastname varchar (100) NOT NULL,
	firstname varchar (100) NOT NULL,
	email varchar (255),
	KEY author (lastname, firstname),
	PRIMARY KEY (author_id)
);

CREATE TABLE OPL_textbook (
    textbook_id int (15) NOT NULL auto_increment,
	title varchar (255) NOT NULL,
	edition int (3) DEFAULT 0 NOT NULL,
	author varchar (63) NOT NULL,
	publisher varchar (127),
	isbn char (15),
	pubdate varchar (27),
	PRIMARY KEY (textbook_id)
);

CREATE TABLE OPL_chapter (
    chapter_id int (15) NOT NULL auto_increment,
	textbook_id int (15),
	number int(3),
	name varchar(127) NOT NULL,
	page int(4),
	KEY (textbook_id, name),
	KEY (number),
	PRIMARY KEY (chapter_id)
    
);

CREATE TABLE OPL_section (
    section_id int(15) NOT NULL auto_increment,
	chapter_id int (15),
	number int(3),
	name varchar(127) NOT NULL,
	page int(4),
	KEY (chapter_id, name),
	KEY (number),
	PRIMARY KEY section (section_id)
);

CREATE TABLE OPL_problem (
    problem_id int(15) NOT NULL auto_increment,
    section_id int(15),
	number int(4) NOT NULL,
	page int(4),
	KEY (section_id),
	PRIMARY KEY (problem_id)
);

CREATE TABLE OPL_keyword (
    keyword_id int(15) NOT NULL auto_increment,
	keyword varchar(65) NOT NULL,
	KEY (keyword),
	PRIMARY KEY (keyword_id)
);

CREATE TABLE OPL_morelt (
    morelt_id int(15) NOT NULL auto_increment,
	name varchar(127) NOT NULL,
	DBsection_id int(15),
	leader int(15), # pgfile_id of the MLT leader
	KEY (name),
	PRIMARY KEY (morelt_id)  
);

CREATE TABLE OPL_path (
    path_id int(15) NOT NULL auto_increment,
	path varchar(255) NOT NULL,
	machine varchar(127),
	user varchar(127),
	KEY (path),
	PRIMARY KEY (path_id)
);

CREATE TABLE OPL_pgfile (
    pgfile_id int(15) NOT NULL auto_increment,
	DBsection_id int(15) NOT NULL,
	author_id int(15),
	institution tinyblob,
	path_id int(15) NOT NULL,
	filename varchar(255) NOT NULL,
	morelt_id int(127) DEFAULT 0 NOT NULL,
	level int(15),
	language varchar(15),
	static TINYINT,
	MO TINYINT,
	PRIMARY KEY (pgfile_id)
);

CREATE TABLE OPL_pgfile_problem (
    pgfile_id int(15) DEFAULT 0 NOT NULL,
	problem_id int(15) DEFAULT 0 NOT NULL,
	PRIMARY KEY (pgfile_id, problem_id)
);

CREATE TABLE OPL_pgfile_keyword (
    pgfile_id int(15) DEFAULT 0 NOT NULL,
	keyword_id int(15) DEFAULT 0 NOT NULL,
	#KEY pgfile_keyword (keyword_id, pgfile_id),
	#KEY pgfile (pgfile_id)  
    PRIMARY KEY (pgfile_id, keyword_id)
);
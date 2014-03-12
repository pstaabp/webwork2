/**
  * This is a class for editing problems (PGProblem) objects.  
  * 
  */

define(['backbone'], function(Backbone){
    var PGProblem = Backbone.Model.extend({
    	defaults:  { 
    		macros: [],
    		preamble: "",
    		statement: void 0,
            description: "",
    		answer: "",
    		hint: "",
    		solution: "",
    		path: "",
            date: "",
            problem_author: "",
            institution: "",
            textbook_title: "",
            textbook_author: "",
            textbook_edition: "",
            textbook_section: "",
            textbook_problem_number: "",
            db_subject: "",
            db_chapter: "",
            db_section: "",
            keywords: [],
            answer_type: "",
		},
        validation: {
            statement: { required: true},
            answer_type: {required: true}
        },

    		
    });

    return PGProblem;
});
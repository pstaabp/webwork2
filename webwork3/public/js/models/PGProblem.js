/**
  * This is a class for editing problems (PGProblem) objects.
  *
  */

define(['jquery','backbone','config'], function($,Backbone,config){
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
        problem_source: "",
        editable: false
  		},
      validation: {
          //statement: { required: true},
          //answer_type: {required: true}
      },
      idAttribute: "path",
      url: function(){
          return config.urlPrefix + "library/renderpgproblem?" +
            $.param({problem_source: this.get("problem_source"), path: this.get("path"), course_id: config.courseSettings.course_id});
      },
      isLibraryProblem: function(){
          return /Library\//.test(this.get("path"));  // just tests if the path starts with Library.  Maybe make this a field instead.
      },
      renderOnServer: function(opts){
          $.ajax({
              url: config.urlPrefix+"renderer/courses/" + opts.course_id+"/problems/0",
              data: {pgSource: this.get("problem_source")},
              type: "POST",
              success: opts.success
          });
      }

  });

  return PGProblem;

});

/*  SimpleEditor.js:
   This is the base javascript code for the SimplePGEditor.  This sets up the View and ....
  
*/


define(['module','backbone','underscore','views/MainView','views/LibraryTreeView','models/PGProblem',
    'models/Problem','models/ProblemList','views/ProblemView','config','moment','apps/util', 'bootstrap'], 
function(module,Backbone, _,MainView,LibraryTreeView,PGProblem,Problem,ProblemList,ProblemView,
            config,moment,util){
var StandardEditor = Backbone.View.extend({
    initialize: function(options) {
        var self = this;
        this.problem = new Problem();
        this.model = new PGProblem();
        this.eventDispatcher = options.eventDispatcher;
   },
    render: function (){
    	this.$el.html($("#standard-editor-template").html());
    	return this;

    },
    setProblem: function(problem){
    	var self = this;
    	this.problem = problem;
    	this.model.set("path",this.problem.get("source_file"))
    	this.model.fetch({success: function (data) {
    		self.loadProblem();
    	}}) 
    },
    loadProblem: function () {
    	this.stickit();
    },
    bindings: {".problem-source": "problem_source"}
});

return StandardEditor;

});
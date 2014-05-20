/*  SimpleEditor.js:
   This is the base javascript code for the SimplePGEditor.  This sets up the View and ....
  
*/


define(['module','backbone','underscore','views/MainView','views/library-views/LibraryTreeView','models/PGProblem',
    'models/Problem','models/ProblemList','views/ProblemView','config','moment','apps/util', 'bootstrap'], 
function(module,Backbone, _,MainView,LibraryTreeView,PGProblem,Problem,ProblemList,ProblemView,
            config,moment,util){
var StandardEditor = MainView.extend({
    initialize: function(options) {
        MainView.prototype.initialize.call(this,options);
        this.parent = options.parent;
        _(this).bindAll("loadProblem");
    },
    render: function (){
    	this.$el.html($("#standard-editor-template").html());
        if(this.problem){
            this.setProblem(this.problem);
            this.loadProblem();
        }
    	return this;

    },
    setProblem: function(problem){
    	var self = this;
    	this.problem = problem;
        if(! this.model){
            this.model = new PGProblem({path: this.problem.get("source_file")});
            this.model.on("change",function(model){
                console.log(model.attributes);
            });
            this.model.fetch({success: function (data) {
                self.loadProblem();
            }});
        }
        this.stickit();
    },
    loadProblem: function () {
        this.$(".info-bar").html("<span class='path'></span>");
        this.stickit();
        // if it's a library problem, disable the editor
        if(this.model.isLibraryProblem()){
            this.$(".problem-source").attr("disabled","disabled");
        } else {
            this.$(".problem-source").removeAttr("disabled");
        }
        if(this.parent.optionPane){
            this.parent.optionPane.setProblem(this.model);
        }
    },
    bindings: {
        ".problem-source": "problem_source",
        ".path": "path"
    },
    events: {
        "show.bs.tab a[href='#std-viewer-tab']": "showViewer"
    },
    showViewer: function() {
        var self = this
            , params = _.extend({displayMode: "MathJax", pgSource: this.model.get("problem_source")});
            this.model.renderOnServer({data: params, course_id: config.courseSettings.course_id,
                success: function(response){
                   self.problem.set({data: response.text});
                   self.renderProblem();
                }
            });
            if(this.parent.optionPane.getOptions().save_option==="Auto Save"){
                this.model.save();
            }
    },
    renderProblem: function (opts) {
        console.log("rendering the problem");
        this.showProblemView = new ShowProblemView({model: this.problem, el: $("#std-viewer-tab")}).render();
    }
});

var ShowProblemView = Backbone.View.extend({
    initialize: function(options) {
      _.bindAll(this,'render');
      this.collection = new ProblemList();  // this is done as a hack b/c Problem View assumes that all problems 
                                            // are in a ProblemList. 
      this.collection.add(this.model);
      problemViewAttrs = {reorderable: false, showPoints: false, showAddTool: false, showEditTool: false,
                showRefreshTool: false, showViewTool: false, showHideTool: false, deletable: false, draggable: false,
                displayMode: "MathJax"};
      this.problemView = new ProblemView({model: this.model, viewAttrs: problemViewAttrs});
    },
    render: function (){
        this.$(".problemList").html("").append(this.problemView.render().el);
        return this;
    },
    setProblem: function(problem){
        this.model = problem;
    }
});

return StandardEditor;

});
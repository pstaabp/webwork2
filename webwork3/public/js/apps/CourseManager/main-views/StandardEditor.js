/*  StandardEditor.js:
   This is the base javascript code for the Standard Problem Editor.  This sets up the View and ....

   A few notes:

      * the model (Backbone Model) for this view is a PGProblem, which is a problem associated with the library
        including source coded
      * the problem is a Backbone Model similar to others that is associated with a problem in a Problem Set.

*/


define(['jquery','module','backbone','underscore','models/PGProblem',
    'models/Problem','models/ProblemList','views/ProblemView','config','moment','apps/util', 'bootstrap'],
function($,module,Backbone, _,MainView,PGProblem,Problem,ProblemList,ProblemView,
            config,moment,util){
var StandardEditor = Backbone.View.extend({
    template: $("#standard-editor-template").html(),
    initialize: function(options) {
        _(this).bindAll("loadProblem");
        this.parent = options.parent;
    },
    render: function (){
    	this.$el.html(this.template);
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
        ".path": "path",
        "#problem-path": "path"
    },
    events: {
        "show.bs.tab a[href='#std-viewer-tab']": "showViewer",
        "click #new-problem": "editNewProblem"
    },
    showViewer: function() {
        var self = this
            , params = _.extend({displayMode: "MathJax", pgSource: this.model.get("problem_source")});

        this.model.save({succes: function(){
          console.log("hi");
        }})

        // this.model.renderOnServer({data: params, course_id: config.courseSettings.course_id,
        //     success: function(response){
        //        self.problem.set({data: response.text});
        //        self.renderProblem();
        //     }
        // });
        // if(this.parent.sidebar.model.get("save_option")==="Auto Save"){
        //     this.model.save();
        // }
    },
    renderProblem: function (opts) {
        console.log("rendering the problem");
        this.showProblemView = new ShowProblemView({model: this.problem, el: $("#std-viewer-tab")}).render();
    },
    editNewProblem: function(){
      var self = this;
      $.ajax({url: config.urlPrefix + "courses/" + config.courseSettings.course_id + "/blank_problem",
      type: "GET",
      success: function(data){
        self.model = new PGProblem({path: "blank.pg",problem_source: data.raw_source});
        self.showProblemToEdit();
      }});
    },
    showProblemToEdit: function (){
      this.setProblem();
      this.$('#standard-editor-tabs a[href="#std-editor-tab"]').tab('show');
      if(this.model.get("editable")){
        this.$('#problem-source').removeAttr("readonly");
        this.$("a[href='#std-viewer-tab']").removeClass("disabled");
      } else {
        this.$('#problem-source').attr("readonly","");
        this.$("a[href='#std-viewer-tab']").addClass("disabled");
        this.$("#editor-message").css("display","block")
          .html("This is a protected file. Please save a copy of this to edit by using the sidebar.");
      }
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

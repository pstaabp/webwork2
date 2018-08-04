/*  StandardEditor.js:
   This is the base javascript code for the Standard Problem Editor.  This sets up the View and ....

   A few notes:

      * the model is a Problem similar to others that is associated with a problem in a Problem Set.

*/


define(['jquery','module','backbone','underscore','models/Problem',
  'models/ProblemList','views/ProblemView','config','moment','apps/util','codemirror/lib/codemirror'
  ,'bootstrap','codemirror/mode/perl/perl'],
function($,module,Backbone, _,Problem,ProblemList,ProblemView,config,moment,util,CodeMirror){
  var StandardEditor = Backbone.View.extend({
    initialize: function(options) {
      var self = this;
      _(this).bindAll("saveProblem","fetchProblemFile","saveAndRenderProblem");
      this.model = new Problem();
      _(this).extend(_(options).pick("parent","problemSets"));
      this.parent.eventDispatcher.on("update-path",this.saveProblem);
      this.tabs = {
        select_problem_tab: new SelectProblemTab({parent: this, problemSets: this.problemSets}),
        edit_problem_tab: new EditProblemTab({parent: this}),
        view_problem_tab: new ViewProblemTab({parent: this})
      }
      this.model.on("change:source_file", this.fetchProblemFile)
        .on("change:pgsource",this.saveAndRenderProblem);
    },
    render: function (){
      this.$el.html($("#standard-editor-template").html());
      var currentTab = this.parent.state.get("tabName") || "#select-problem-tab";

      // this.tabs[currentTab.replace("#","").replace(/-/g,"_")]
      //   .setElement(this.$(currentTab)).render();
      this.tabs.select_problem_tab.setElement(this.$("#select-problem-tab")).render();
      this.tabs.edit_problem_tab.setElement(this.$("#edit-problem-tab")).render();
      this.tabs.view_problem_tab.setElement(this.$("#view-problem-tab")).render();
      this.showTab(currentTab);

      this.stickit();
      util.changeClass({state: this.model.get("editable"),
        els: $("a[href='#view-problem-tab']"), remove_class: "disabled"});
    	return this;
    },
    bindings: {
        "#problem-path": {observe: "source_file", events: ['blur']}
    },
    showTab: function(tab_name){
      this.$('#standard-editor-tabs a[href="'+tab_name+'"]').tab('show');

      // there's a bug in the bootstrap tab which the following lines fix:
      this.$(".tab-pane").removeClass("active")
      this.$(tab_name).addClass("active")

    },
    saveProblem: function(opt) {
      var self = this;
      this.model.set({source_file: opt.get("directory")+"/"+opt.get("filename")}).save(
        {save_file: true},
        {
          success: function(){

          },
          error: function(opt1,opt2,opt3){
            console.log(opt1,opt2,opt3);
            alert(opt2.responseJSON.message);
          }
        }
      );
    },
    saveAndRenderProblem: function(){
      this.model.save()
    },
    fetchProblemFile: function(_model){
      var self = this;
      delete this.model.attributes._id;
      delete this.model._id; // this is to make the problem new to the server.
      this.model.save({source_file: _model.get("source_file")},{
        success: function(){
          self.showTab("#edit-problem-tab");
        }
      })
    },
    events: {
      "shown.bs.tab a[href='#view-problem-tab']": "showViewer",
      "shown.bs.tab a[data-toggle='tab']": function (evt) {
        this.parent.setState({tabName: $(evt.target).attr("href")});}
    },
    editNewProblem: function(){
      var self = this;
      this.model = new Problem();
      this.model.fetch({
        success: function(data){
          self.showTab("#edit-problem-tab");
          self.tabs.edit_problem_tab.render();
          self.stickit();
        }});
    }
});

var SelectProblemTab = Backbone.View.extend({
  initialize: function(options) {
    _(this).extend(_(options).pick("parent","problemSets"));
    _(this).bindAll("updateFiles","selectFile","updateProblemSet","selectProblem");
    this.selectOptions = new Backbone.Model();
    this.selectOptions.on("change:directory",this.updateFiles);
    this.selectOptions.on("change:file",this.selectFile);
    this.selectOptions.on("change:problem-set",this.updateProblemSet);
    this.selectOptions.on("change:problem-number",this.selectProblem);
  },
  render: function(){
    var self = this;
    this.$el.html($("#editor-select-problem-template").html());
    if(typeof(this.course_directories)=="undefined"){
      $.ajax({ // load the load directories.
          url: config.urlPrefix+"courses/" + config.courseSettings.course_id+"/pgproblems/directories",
          type: "GET",
          success: function (data) {
            self.course_directories = data.dirs;
            self.stickit(self.selectOptions,self.bindings);
          }
        });
      }
    self.stickit(self.selectOptions,self.bindings);
    return this;
  },
  bindings: {
    "#local-file-directory": {
        observe: "directory", selectOptions: {
          collection: function () { return _(["[TOP]"])
                            .union(this.course_directories);
                            },
			defaultOption: {label: "Select Directory...", value: null}
		}},
    "#local-file": {
        observe: "file", selectOptions: {
          collection: function () { return this.pgfiles || [];
                            },
			defaultOption: {label: "Select File...", value: null}
		}},
    "#problem-set": {
      observe: "problem-set", selectOptions: {
        collection: function () { return this.problemSets.pluck("set_id")},
        defaultOption: {label: "Select Problem Set...", value: null}
      }
    },
    "#problem-number": {
      observe: "problem-number", selectOptions: {
        collection: function () {
          var set = this.problemSets.find({set_id: this.selectOptions.get("problem-set")});
          return (typeof set === "undefined")? []: set.problems.pluck("problem_id");
        },
        defaultOption: {label: "Select Problem Number...", value: null}
      }
    },

  },
  events: {
    "click #new-problem": function() {this.parent.editNewProblem()}
  },
  updateFiles: function(){
    var self = this;
    $.ajax({ // load the load directories.
        url: config.urlPrefix+"courses/" + config.courseSettings.course_id+"/pgproblems/files"
          + "?"+$.param(self.selectOptions.pick("directory")),
        type: "GET",
        success: function (data) {
          self.pgfiles = data.files;
          self.stickit(self.selectOptions,self.bindings);
        }
      });
  },
  selectFile: function (){
    this.parent.model.set({source_file: this.selectOptions.get("directory")+"/" +this.selectOptions.get("file")});
  },
  updateProblemSet: function(){
    this.stickit(this.selectOptions,this.bindings);
  },
  selectProblem: function(){
    var set = this.problemSets.find({set_id: this.selectOptions.get("problem-set")});
    var problem = set.problems.find({problem_id: this.selectOptions.get("problem-number")});
    this.parent.model.set(problem.pick("source_file"));
  }
});

var EditProblemTab = Backbone.View.extend({
  template : $("#editor-edit-problem-template").html(),
  initialize: function(options) {
    var self = this;
    _(this).bindAll("rerenderProblem","updateInfo");
    _(this).extend(_(options).pick("parent"));
    this.parent.model.on("change:pgsource",this.rerenderProblem);
    this.parent.model.on("change:editable",function(){
      if(self.editor){
        self.editor.options.readOnly = ! self.parent.model.get("editable");
      }
    })
  },
  render: function(){
    var self = this;
    this.$el.html(this.template);
    if(this.parent.model){
      this.stickit(this.parent.model,this.bindings);
    }
    var textArea = this.$("#problem-source")
    if(textArea){
      this.editor = CodeMirror.fromTextArea(textArea[0],
          {mode: "perl",lineNumbers: true});
      this.editor.options.readOnly = ! this.parent.model.get("editable");
      this.editor.setValue(this.parent.model.get("pgsource"));
      this.editor.on("blur",this.updateInfo);
      _.delay(function(){self.editor.refresh();},100);
    }
    return this;
  },
  updateInfo: function(evt){
    this.parent.model.set({pgsource: this.editor.getValue()});
  },
  rerenderProblem: function(_model){
    var self = this;
    if(this.editor){
      this.editor.setValue(_model.get("pgsource"))
      _.delay(function(){self.editor.refresh();},100);
    }
  },
  bindings: {
    "#editor-message": {
        observe: "editable",
        update: function($el, val, model, options) {
          util.changeClass({els: $el, add_class: "d-none",
              remove_class: "d-block", state: val});}
    }
  },
  events: {
    "click #new-problem": function() {this.parent.editNewProblem()}
  }

});

var ViewProblemTab = Backbone.View.extend({
  template: $("#editor-view-problem-template").html(),
    initialize: function(options) {
      _(this).bindAll("render");
      this.parent = options.parent;
      this.collection = new ProblemList();  // this is done as a hack b/c Problem View assumes that all problems
                                            // are in a ProblemList.
      problemViewAttrs = {reorderable: false, showPoints: false, showAddTool: false, showEditTool: false,
                showRefreshTool: false, showViewTool: false, showHideTool: false, deletable: false, draggable: false,
                displayMode: "MathJax", showMaxAttempts: false, markCorrect: false};
      this.parent.model.on("change:data",this.render);
    },
    render: function (){
      this.$el.html(this.template);
      if(this.parent.model && this.parent.model.get("data")){
        this.problemView = new ProblemView({model: this.parent.model, viewAttrs: problemViewAttrs});
        this.$(".problemList").html("").append(this.problemView.render().el);
      }
      return this;
    },
    setProblem: function(problem){
        this.model = problem;
    }
});

return StandardEditor;

});

/*  SimpleEditor.js:
   This is the base javascript code for the SimplePGEditor.  This sets up the View and ....
  
*/


define(['module','backbone','views/MainView','main-views/SimpleEditor','main-views/StandardEditor','models/Problem'],
	function(module,Backbone,MainView,SimpleEditor,StandardEditor,Problem){
var EditorView = MainView.extend({
    initialize: function(options) {
        var opts = _.extend({},options,{parent: this})
    	MainView.prototype.initialize.call(this,opts);
        
    	_.extend(opts,{settings: this.settings,problemSets: this.problemSets, users: this.users});
        this.editor = (options.settings.getSettingValue("ww3{editor}")==="Simple")?  new SimpleEditor(opts) 
            : new StandardEditor(opts);
    },
    render: function(){
    	this.$el.html(this.editor.render().el);
    },
    setProblem: function(problem){
        this.editor.setProblem(problem);
    },
    getState: function () {
        return {path: this.editor.problem.get("source_file")};
    },
    setState: function(state){
        delete this.model;
        this.setProblem(new Problem({"source_file":state.path}));
        return this;
    }
});

return EditorView;

});
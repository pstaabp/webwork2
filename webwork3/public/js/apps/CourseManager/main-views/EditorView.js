/*  SimpleEditor.js:
   This is the base javascript code for the SimplePGEditor.  This sets up the View and ....
  
*/


define(['module','backbone','views/MainView','main-views/SimpleEditor','main-views/StandardEditor','models/Problem'],
	function(module,Backbone,MainView,SimpleEditor,StandardEditor,Problem){
var EditorView = MainView.extend({
    initialize: function(options) {
        MainView.prototype.initialize.call(this,options);
        var opts = _.extend({},options,{parent: this})
        this.editor = (options.settings.getSettingValue("ww3{editor}")==="Simple")?  new SimpleEditor(opts) 
            : new StandardEditor(opts);
    },
    render: function(){
    	this.$el.html(this.editor.render().el);
        MainView.prototype.render.apply(this);
	    return this;
    },
    setProblem: function(problem){
        this.editor.setProblem(problem);
    },
    getDefaultState: function () {
        return {path: ""};
     }
});

return EditorView;

});
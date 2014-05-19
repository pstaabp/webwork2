/*  SimpleEditor.js:
   This is the base javascript code for the SimplePGEditor.  This sets up the View and ....
  
*/


define(['module','backbone','views/MainView','main-views/SimpleEditor','main-views/StandardEditor'],
	function(module,Backbone,MainView,SimpleEditor,StandardEditor){
var EditorView = MainView.extend({
    initialize: function(options) {
    	MainView.prototype.initialize.apply(this,[options]);
    	_.extend(options,{settings: this.settings,problemSets: this.problemSets, users: this.users});
    	this.editor = (options.settings.getSettingValue("ww3{editor}")==="Simple")?  new SimpleEditor(options) 
    		: new StandardEditor(options);
    },
    render: function(){
    	this.$el.html(this.editor.render().el);
    }
});

return EditorView;

});
/*  SimpleEditor.js:
   This is the base javascript code for the SimplePGEditor.  This sets up the View and ....
  
*/


define(['module','backbone','views/MainView','config','main-views/SimpleEditor','main-views/StandardEditor'],
	function(module,Backbone,MainView,config,SimpleEditor,StandardEditor){
var EditorView = MainView.extend({
    initialize: function(options) {
    	this.editor = (config.settings.getSettingValue("ww3{editor}")==="Simple")?  new SimpleEditor(options) 
    		: new StandardEditor(options);
    },
    render: function(){
    	this.$el.html(this.editor.render().el);
    }
});

return EditorView;

});
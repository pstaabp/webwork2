/*  SimpleEditor.js:
   This is the base javascript code for the SimplePGEditor.  This sets up the View and ....
  
*/


define(['module','backbone','views/MainView','main-views/SimpleEditor','main-views/StandardEditor'],
	function(module,Backbone,MainView,SimpleEditor,StandardEditor){
var EditorView = MainView.extend({
    initialize: function(options) {
    	MainView.prototype.initialize.apply(this,[options]);
    	this.allOptions = options;
    	_.extend(this.allOptions,{settings: this.settings,problemSets: this.problemSets, users: this.users});
    },
    render: function(){
    	this.editor = (this.settings.getSettingValue("ww3{editor}")==="Simple")?  new SimpleEditor(this.allOptions) 
    		: new StandardEditor(this.allOptions);

    	this.$el.html(this.editor.render().el);
    },
    getState: function () {
    	return {};
    }
});

return EditorView;

});
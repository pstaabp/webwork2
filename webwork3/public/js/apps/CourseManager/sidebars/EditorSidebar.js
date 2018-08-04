define(['jquery','backbone','views/Sidebar', 'config','apps/util'],function($,Backbone,Sidebar,config,util){
	var EditorSidebar = Sidebar.extend({
		course_directories: [],
		pgProblem: null,
    initialize: function(options){
			var self = this;
        Sidebar.prototype.initialize.apply(this,[options]);
        _(this).extend(_(options).pick("settings","problemSets"));
        var EditorOptions = Backbone.Model.extend({});
        this.editorOptions = new EditorOptions({display_option: this.settings.getSettingValue("pg{options}{displayMode}"),
            filename: "",add_to_set: "", directory: ""});
        _.extend(this,Backbone.Events);
				this.editorOptions.on("change:directory",function(_model){
					util.changeClass({state: _model.get("directory")=="New Directory",
							remove_class: "d-none", add_class: "d-block", els: self.$("#new-directory").parent()});
				})
    },
    render: function(){
        this.$el.html($("#editor-sidepane-template").html());
        this.stickit(this.editorOptions,this.bindings);
        return this;
    },
    setProblem: function(problem){
        this.problem = problem;
        this.model.set({source_file: problem.get("path")});
    },
    bindings: {
        ".problem-display-option": {observe: "display_option", selectOptions: {
            collection: function () {
                var modes = this.settings.getSettingValue("pg{displayModes}").slice();
                modes.push("None");
                return modes;
            }}
        },
        ".problem-save-option": {observe: "save_option", selectOptions: {
            collection: ["","Auto Save","Save As..."]
        }},
        "#problem-filename": "filename",
        ".select-add-to-set": {observe: "add_to_set", selectOptions: {
            collection: function () {
                return this.problemSets.pluck("set_id");
            },
            defaultOption: {label: "Select Target...", value: null}
        }},
		"#directory-select": {observe: "directory", selectOptions: {
			collection: function () { return _(["[TOP]"]).chain()
                            .union(this.course_directories)
                            .union(["New Directory"]).value();},
			defaultOption: {label: "Select Directory...", value: null}
		}}
    },
    events: {
        "change .problem-display-option": function (evt) { this.trigger("change-display-mode", evt);},
				"click #save-as-button": "saveAsOptions",
				"click #create-copy-button": "createCopy"
    },
	saveAsOptions: function (){
		var self = this;
		$.ajax({
				url: config.urlPrefix+"courses/" + config.courseSettings.course_id+"/pgproblems/directories",
				type: "GET",
				success: function (data) {
					self.course_directories = data.dirs;
					self.stickit(self.editorOptions,self.bindings);
				}
		});
		this.$("#save-as-options").removeClass("d-none").addClass("d-block");
	},
	createCopy: function(){
        this.eventDispatcher.trigger("update-path",this.editorOptions)
	},
    getOptions: function(){
        return this.model.attributes;
    }
});

return EditorSidebar;
})

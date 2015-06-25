define(['backbone','views/Sidebar', 'config'],function(Backbone,Sidebar,config){
	var EditorSidebar = Sidebar.extend({
    initialize: function(options){
        Sidebar.prototype.initialize.apply(this,[options]);
        _(this).extend(_(options).pick("settings","problemSets"));
        var EditorOptions = Backbone.Model.extend({});
        this.model = new EditorOptions({display_option: this.settings.getSettingValue("pg{options}{displayMode}"),
            save_option: "Auto Save", source_file: "",add_to_set: ""});
        _.extend(this,Backbone.Events);
    },
    render: function(){
        this.$el.html($("#editor-sidepane-template").html());
        this.stickit();
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
        ".problem-filename": "source_file",
        ".select-add-to-set": {observe: "add_to_set", selectOptions: {
            collection: function () { 
                return this.problemSets.pluck("set_id"); 
            },
            defaultOption: {label: "Select Target...", value: null}
        }},
    },
    events: {
        "change .problem-display-option": function (evt) { this.trigger("change-display-mode", evt);},
    },
    getOptions: function(){
        return this.model.attributes;
    }
});

return EditorSidebar;
})
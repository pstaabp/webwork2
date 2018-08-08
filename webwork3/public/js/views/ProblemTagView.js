define(['jquery','backbone','models/ProblemTags','config'],
function($,Backbone, ProblemTags,config) {
    var ProblemTagView = Backbone.View.extend({
        viewTemplate: $("#show-tags-template").html(),
        editTemplate: $("#tag-editor-template").html(),
        initialize: function(options){
            var self = this;
            _(this).bindAll("updateDBsubjects","updateDBchapters");
            _(this).extend(_(options).pick("edit_tags"));

            this.dbsubjects = [];
            this.dbchapters = [];
            this.dbsections = [];
            this.model.on({"change:DBsubject":function () {
                                                self.model.set({DBchapter: null, DBsection: null});
                                                self.updateDBsubjects(); },
                           "change:DBchapter":this.updateDBchapters});
        },
        render: function(){
            var self = this;
            if(this.edit_tags){
                this.$el.html(this.editTemplate);
            } else {
                this.$el.html(this.viewTemplate);
            }
            if(_.isUndefined(config.taxonomy)){
                $.ajax({ url: config.urlPrefix + "library/courses/" +config.courseSettings.course_id
                            +"/taxonomy", success: function(data){
                    config.taxonomy = data;
                    var chapters = [];
                    self.dbsubjects = _(config.taxonomy).map(function(subj) { return subj.name;});
                    self.updateDBsubjects();
                    self.updateDBchapters();

                    self.stickit();
                }});
            }
            console.log(self.model.attributes);
            this.stickit();
            return this;
        },
        bindings: {
            ".level-attribute": {observe: "Level", selectOptions: {collection: [1,2,3,4,5,6]}},
            ".keyword-attribute": {observe: "keywords",
                                   onGet: function(val) {
                                        return val.join(",");
                                   }},
            ".author-attribute": "Author",
            ".institution-attribute": "Institution",
            ".dbsubject-attribute": {observe: "DBsubject", selectOptions: {collection: "this.dbsubjects"}},
            ".dbchapter-attribute": {observe: "DBchapter", selectOptions: {collection: "this.dbchapters",
                                                            defaultOption: {
                                                                  label: 'Select a Chapter...',  // I18N
                                                                  value: null
            }}},
            ".dbsection-attribute": {observe: "DBsection", selectOptions: {collection: "this.dbsections",
                                                        defaultOption: {
                                                                  label: 'Select a Section...',  // I18N
                                                                  value: null
            }}},
            ".MO-attribute": "MO",
            ".MLT-attribute": "MLT",
            ".MLT-leader-attribute": "MLTleader",
        },
        set: function(opts){
            _(this).extend(_(opts).pick("model"));
            return this;
        },
        updateDBsubjects: function () {
            if(this.model.get("DBsubject")){
                var chapters = _(config.taxonomy).findWhere({name: this.model.get("DBsubject")}).subfields;
                this.dbchapters = _(chapters).map(function(ch) { return ch.name;});
            }
            this.stickit();
        },
        updateDBchapters: function () {
            var chapters = _(config.taxonomy).findWhere({name: this.model.get("DBsubject")}).subfields;
            if(_.isEmpty(this.model.get("DBchapter"))){
               this.dbsections = [];
            } else if(this.model.get("DBchapter")){
                var sections = _(chapters).findWhere({name: this.model.get("DBchapter")}).subfields;
                this.dbsections = _(sections).map(function(sect) { return sect.name;});
            }
            this.stickit();
        }

    });

    return ProblemTagView;
});

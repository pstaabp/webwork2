define(['backbone','models/ProblemTags'], 
function(Backbone, ProblemTags) {
    var ProblemTagView = Backbone.View.extend({
        viewTemplate: "",
        editTemplate: $("#tag-editor-template").html(),
        initialize: function(options){
            _(this).bindAll("updateDBsubjects","updateDBchapters");
        
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
            if(typeof(this.taxonomy) == "undefined"){
                $.ajax({ url: config.urlPrefix + "library/taxonomy", success: function(data){
                    self.taxonomy = data;
                    var chapters = [];
                    self.dbsubjects = _(self.taxonomy).map(function(subj) { return subj.name;});
                    self.updateDBsubjects();
                    self.updateDBchapters();
                    
                    self.stickit();
                }}); 
            }
            this.stickit();
            return this;
        },
        bindings: {
            "#level-attribute": {observe: "Level", selectOptions: {collection: [1,2,3,4,5,6]}},
            "#keyword-attribute": {observe: "keywords",
                                   onGet: function(val) {
                                        return val.join(",");  
                                   }},
            "#author-attribute": "Author",
            "#institution-attribute": "Institution",
            "#dbsubject-attribute": {observe: "DBsubject", selectOptions: {collection: "this.dbsubjects"}},
            "#dbchapter-attribute": {observe: "DBchapter", selectOptions: {collection: "this.dbchapters", 
                                                            defaultOption: {
                                                                  label: 'Select a Chapter...',  // I18N
                                                                  value: null
            }}},
            "#dbsection-attribute": {observe: "DBsection", selectOptions: {collection: "this.dbsections",
                                                        defaultOption: {
                                                                  label: 'Select a Section...',  // I18N
                                                                  value: null
            }}},
            "#MO-attribute": "MO",
            "#MLT-attribute": "MLT",
            "#MLT-leader-attribute": "MLTleader",
        },
        set: function(opts){
            _(this).extend(_(opts).pick("model"));
            return this;
        }, 
        updateDBsubjects: function () {
            if(this.model.get("DBsubject")){
                var chapters = _(this.taxonomy).findWhere({name: this.model.get("DBsubject")}).subfields;
                this.dbchapters = _(chapters).map(function(ch) { return ch.name;});
            }
            this.stickit();
        },
        updateDBchapters: function () {
            var chapters = _(this.taxonomy).findWhere({name: this.model.get("DBsubject")}).subfields;
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
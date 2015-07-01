/*
*  This is the a view of an interface to search the problem library
*
*  
*/ 


define(['backbone', 'underscore','views/library-views/LibraryView','models/ProblemList','config','models/Problem'], 
function(Backbone, _, LibraryView,ProblemList,config,Problem){
    var LocalLibraryView = LibraryView.extend({
        tabName: "Local Problems",
    	initialize: function (options){
            _(this).bindAll("buildMenu");
            LibraryView.prototype.initialize.apply(this,[options]);
            this.libBrowserType = options.libBrowserType;
            this.libraryProblemsView.problems.type = "localLibrary";
            //this.settings = options.settings;

    	},
        events: function(){
            return _.extend({},LibraryView.prototype.events,{
                "click .load-problems-button": "render"
            });
        },
        render: function (){
            var self = this; 
            LibraryView.prototype.render.apply(this);
            this.$(".library-tree-container").html($("#local-library-tree-template").html());
            //this.libraryProblemsView.reset();
            // the 
            if(typeof(this.localProblems)==="undefined" || this.localProblems.size()== 0) {
                
                this.$(".library-tree-container").html($("#loading-library-template").html());
                this.localProblems = new ProblemList();
                this.localProblems.type = this.libBrowserType;
                this.localProblems.fetch({success: self.buildMenu});
            } else if (this.tabState.get("selected_dir")){
                this.showProblems();
                this.libraryProblemsView.renderProblems();
            }
            this.stickit(this.tabState,this.bindings);
            return this;
    	},
        bindings: {
            ".local-library-tree-select" : {observe: "selected_dir", selectOptions: {
                collection: 'this.directories'   
            }}
        },
        showProblems: function (){
            var self = this;
            if(this.tabState.get("selected_dir") == "TOPDIR"){
                this.tabState.set("selected_dir","");
            }
            
            this.problemList = new ProblemList();
            this.localProblems.each(function(prob){
                var comps = prob.get("source_file").split("/");
                comps.pop();
                var topDir = comps.join("/");
                if( topDir==self.tabState.get("selected_dir")){
                    self.problemList.add(new Problem(prob.attributes),{silent: true});
                }
            });
            LibraryView.prototype.showProblems.apply(this);

        }, 
        buildMenu: function () {
            var self = this; 
            this.directories = [];
            this.localProblems.each(function(prob){
                var comps = prob.get("source_file").split("/");
                comps.pop();
                self.directories.push(comps.join("/"));
            })
            this.directories = _(this.directories).unique(); 
            var index = _(this.directories).indexOf("");
            if (index >-1){
                this.directories[index]= "TOPDIR";
            }
            this.render();
        }
    });

    return LocalLibraryView;
});

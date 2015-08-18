/*
*  This is the a view of an interface to search the problem library
*
*  
*/ 


define(['backbone', 'underscore','views/library-views/LibraryView','models/ProblemList','config',
        'models/Problem','views/library-views/LibraryTreeView'], 
function(Backbone, _, LibraryView,ProblemList,config,Problem,LibraryTreeView){
    var LocalLibraryView = LibraryView.extend({
        tabName: "Local Problems",
    	initialize: function (options){
            _(this).extend(_(options).pick("tabName"));
            LibraryView.prototype.initialize.apply(this,[options]);
            this.libBrowserType = options.libBrowserType;
            this.libraryProblemsView.problems.type = "localLibrary";
            this.libraryTreeView = new LocalLibraryTreeView({libraryView: this});
            //this.settings = options.settings;

    	},
        /*showProblems: function (_dir){
            var self = this;
            this.tabState.set("selected_dir", _dir == "TOPDIR" ? "": _dir); 
            
            this.problemList.each(function(prob){
                var comps = prob.get("source_file").split("/");
                comps.pop();
                var topDir = comps.join("/");
                if( topDir==self.tabState.get("selected_dir")){
                    self.problemList.add(new Problem(prob.attributes),{silent: true});
                }
            });
            LibraryView.prototype.showProblems.apply(this);

        }*/
    });
    
    var LocalLibraryTreeView = LibraryTreeView.extend({
        template: $("#local-library-tree-template").html(),
        initialize: function(options){
            var self = this; 
            _(this).bindAll("render");
            this.libraryView = options.libraryView || console.error("libraryView must be defined");  
            this.model = new Backbone.Model({directory: ""}); 
            this.model.on("change:directory",function(){
                var obj = _(self.directories).findWhere({path: self.model.get("directory")});
                self.$(".load-library-button").text("Load " + obj.num_files + " problems"); // I18N
            });
            this.directories = [];
        },
        render: function () {
            self = this; 
            if(_.isEmpty(this.directories)){
                this.$el.html($("#library-tree-template").html());
                var getDirectoryURL = config.urlPrefix + "courses/" + config.courseSettings.course_id + "/library/pending";
                $.ajax({url: getDirectoryURL, success: function(data){
                        self.directories = data; 
                        self.render();
                }}); 
            } else {
                this.$el.html($("#local-library-tree-template").html());
            }
            this.stickit(); 
        },
        bindings: {
            ".local-library-tree-select" : {observe: "directory", selectOptions: {
                collection: 'this.directories', labelPath: "path", valuePath: "path"  
            }}
        },
        events: { 
            "click .load-library-button": function () { 
                this.libraryView.loadProblems({directory: "Pending/" +this.model.get("directory")});
                this.libraryView.showProblems();
            }
        }
    }); 

    return LocalLibraryView;
});

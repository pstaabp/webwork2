/*
*  This is the a view of a library (subject, directories, or local) typically within a LibraryBrowser view. 
*
*  This contains the basic functionality of each of the types of library views.  
*
*  There are two other views contained in this one: 
*        1) LibraryTreeView which displays a series of select options to each library type
*        2) LibraryProblemsView which displays the problems after they have been selected.  
*/ 

define(['backbone', 'underscore','config','views/TabView','views/library-views/LibraryProblemsView','models/ProblemList'], 
function(Backbone, _,config,TabView,LibraryProblemsView, ProblemList){
    var LibraryView = TabView.extend({
        className: "library-view",
    	initialize: function (options){
    		var self = this;
            _.bindAll(this,'addProblem','loadProblems','showProblems','changeDisplayMode','setTargetSet');
            _(this).extend(_(options).pick("parent","problemSets","libBrowserType","settings"
                                            ,"eventDispatcher","messageTemplate"));
            this.libraryProblemsView = new LibraryProblemsView({libraryView: this, 
                                                                messageTemplate: this.messageTemplate,
                                                                problemSets: this.problemSets, 
                                                                settings: this.settings})
                .on("page-changed",function(num){
                    self.tabState.set("page_num",num);
                })
            TabView.prototype.initialize.apply(this,[options]); // call the TabView constructor
            this.on("goto-first-page",function() {
                self.tabState.set("page_num",0);
                this.libraryProblemsView.gotoPage(0); 
            })
            
            
    	},
    	/*events: {   
            "change .target-set": "resetDisplayModes"
        }, */ 
    	render: function (){
            var self = this, i;
            var modes = this.settings.getSettingValue("pg{displayModes}").slice(0); // slice makes a copy of the array.
            modes.push("None");

    		this.$el.html($("#library-view-template").html());
            if(this.libraryTreeView){
                var _fields = {};
                for(i=0;i<4;i++){
                    _fields["level"+i] = this.tabState.get("library_path")[i];
                }
                this.libraryTreeView.fields.set(_fields,{silent: true});
                this.libraryTreeView.fields.on("change",function(model){
                    self.libraryProblemsView.reset();
                    self.tabState.set("library_path",model.values());
                });
                this.libraryTreeView.setElement(this.$(".library-tree-container")).render();
            }
            this.libraryProblemsView.setElement(this.$(".problems-container"));
            if(this.tabState.get("rendered")){
                this.libraryProblemsView.render();
                this.loadProblems();
                
            }
            this.parent.state.on("change:sidebar",this.sidebarChanged,this);
            return this;
    	},
        getDefaultState: function () {
            return {library_path: "", page_num: 0, rendered: false, page_size: 10};
        },
        changeDisplayMode:function(evt){
            this.libraryProblemsView.changeDisplayMode(this.parent.state.get("display_mode"));
        },
        resetDisplayModes: function(){  // needed if there no target set was selected. 
            this.$('.target-set').css('background-color','white');
            this.$('.target-set').popover("hide");
        },
        setTargetSet: function(set_id){
            this.tabState.set("target_set_id", set_id);
            this.libraryProblemsView.highlightCommonProblems();
        },
        addProblem: function(model){
            var problemSet = this.problemSets.findWhere({set_id: this.tabState.get("target_set_id")});
            if(!problemSet){
                $("#select-target-option").css("background-color","rgba(255,0,0,0.4)")
                    .popover({placement: "bottom",
                            content: this.messageTemplate({type:"select_target_set"})}).popover("show");
                return;
            }
            problemSet.addProblem(model);
        },
        showProblems: function () {
            var self = this;
            this.tabState.set("rendered",true);
            // I18N
            this.$(".load-library-button").button("reset").text("Load " + this.problemList.length + " problems");  
            this.libraryProblemsView.set({problems: this.problemList, type:this.libBrowserType})
                    .updatePaginator().gotoPage(this.tabState.get("page_num")).highlightCommonProblems()
                    .showPath(this.parent.state.get("show_path"))
                    .showTags(this.parent.state.get("show_tags"));
            this.parent.state.on("change:show_path",function(){
                self.libraryProblemsView.showPath(self.parent.state.get("show_path"));
            }).on("change:show_tags",function(){
                self.libraryProblemsView.showTags(self.parent.state.get("show_tags"));
            })
        },
    	loadProblems: function (){   
            this.$(".load-library-button").button("loading"); 	
            var _path = this.libraryTreeView.fields.values();
            _(this.problemList = new ProblemList()).extend({path: _path, type: this.libBrowserType})
            this.problemList.fetch({success: this.showProblems});
    	},
        sidebarChanged: function(){
            // disable problem dragging unless the sidebar is problem set
            config.changeClass({state: this.parent.state.get("sidebar")=="problemSets", 
                                els: this.$(".drag-handle"), remove_class: "disabled"});
        }
    });

    return LibraryView;
});

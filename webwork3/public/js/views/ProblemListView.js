define(['backbone', 'underscore', 'views/ProblemView','config','models/ProblemList'], 
    function(Backbone, _, ProblemView,config,ProblemList){

    /******
      * 
      *  The ProblemListView is a View of the ProblemList Collection and designed to be a super class of
      *  a ProblemSetView or a LibraryProblemListView.  In short, it displays the problems in the ProblemList
      *   This is used for both a list of problems from the library (global or local) as well as a problem set. 
      * 
      *  The inherited class must define the following:
      *  viewAttrs:  an object of viewing attributes that are passed to the ProblemView to determine how it is decorated.  
      *  headerTemplate: a string of the jquery selector for the template used to render the header.
      *                     The template needs to contain a <div class="prob-list"></div> where the problems will be shown  
      *  displayModes: an array of strings of the possible display modes for problem rendering. 
      *  
      *  The set name and list of problems are passed in the setProblems function.  
      *
      * 
      *  The problems are displayed on "pages", each containing 10 (or another value) problems.  These are
      *  stored in the this.pages array....
      *
      *  The this.state.get("current_page") stores the value of the page that is currently being rendered.  
      */

    var ProblemListView = Backbone.View.extend({

        initialize: function(options){
            var self = this;
            _.bindAll(this,"render","deleteProblem","undoDelete","reorder","addProblemView");  
            _(this).extend(_(options).pick("settings","problemSet","messageTemplate"));
            this.problems = options.problems ? options.problems : new ProblemList();
            this.problemSet = options.problemSet; 
            this.undoStack = []; // this is where problems are placed upon delete, so the delete can be undone.  
            this.pages = [];  // this stores the pages as arrays of problems
            this.problemViews = []; // this is the problemView for the viewable set of problems 
                        
            this.state = new Backbone.Model({show_tags: false, page_size: 10, show_path: false, 
                                             show_hints: false, show_solution: false, current_page: 0});
            
            _.extend(this.viewAttrs,{type: options.type});
            this.state.on("change:current_page",function(){
                self.updateProblems();    
                if(self.state.get("current_page") >= self.pages.length){
                    self.state.set("current_page",0);
                }
                self.renderProblems();
            }).on("change:display_mode",function(){
                self.updateProblems();
                self.renderProblems();
            });
        },
        set: function(opts){
            var self = this; 
            if(opts.problems){
                this.problems = opts.problems; 
                this.problems.off("remove").on("remove",this.deleteProblem);
                if(opts.problemSet){
                    this.problemSet = opts.problemSet;
                    this.problems.problemSet = opts.problemSet;
                    var currentPage = []; 
                    this.pages = [];
                    this.problems.each(function(prob,i){
                        currentPage.push({leader:true,num:i});
                        if(currentPage.length>self.state.get("page_size")){
                            self.pages.push(currentPage); 
                            currentPage = [];
                        }
                    });
                    self.pages.push(currentPage);
                }
                if(this.libraryView){
                    this.sortProblems();
                }
            }
            if(opts.current_page){
                this.state.set("current_page", opts.current_page || 0);
            }
            this.state.set(_(opts).pick("show_path","show_tags","show_solution","show_hints"))
            this.viewAttrs.type = opts.type || "set"; // what is this for?
            this.state.set(_(opts).pick("display_mode"));
            return this; 
        },
        // this function pulls out only the problems to show in the library. 
        sortProblems: function (){
            var self = this; 
            this.pages = [];
            var currentPage = []; 
            //var probNumOnPage = 0; 
            this.problems.each(function(prob,i){
                if(currentPage.length>=self.state.get("page_size") && ( prob.get("morelt_id") == 0 || 
                            prob.get("morelt_id") != self.problems.at(i-1).get("morelt_id"))){
                    self.pages.push(currentPage); 
                    currentPage = [];
                }

                if(prob.get("mlt_leader") || prob.get("morelt_id")==0){
                    currentPage.push({leader:true,num:i})   
                } else {
                    currentPage.push({leader:false,num:i});
                }
            });
            self.pages.push(currentPage);
        },
        render: function() {
            var tmpl = _.template($("#problem-list-template").html());
            this.$el.html(tmpl({show_undo: this.viewAttrs.show_undo}));
            _(this.problemViews).each(function(pv){
                pv.rendered = false;  
            })
            if(this.pages.length>0 & this.problems.length>0){
                this.renderProblems();
                //this.updatePaginator().gotoPage(this.state.get("current_page") || 0);
            }
            if(this.libraryView && this.libraryView.libProblemListView){
                this.libraryView.libraryProblemsView.highlightCommonProblems();
            }
            return this;
        },
        updateProblems: function(){
            var self = this;
            _(this.problemViews).each(function(pv){
                pv.model.set('data','');
                pv.remove();
            });
            this.problemViews = []; 
            _(this.pages[this.state.get("current_page")]).each(function(obj){
                self.problemViews.push(new ProblemView({model: self.problems.at(obj.num), hidden: !obj.leader,
                                                        libraryView: self.libraryView, 
                                                        viewAttrs: self.viewAttrs,
                                                        display_mode: self.state.get("display_mode") }));
            });
        },
        renderProblems: function () {
            var self = this;
            var ul = this.$(".prob-list").empty();
            if(this.problemViews.length == 0){
                this.updateProblems();   
            }
            _(this.problemViews).each(function(pv){
                ul.append(pv.set({display_mode: self.state.get("display_mode")}).render().el); 
                //ul.append(pv.render().el); 
                
                // what is this needed for? 
                pv.model.once("rendered",function(_m){
                    if(self.libraryView){
                        self.libraryView.sidebarChanged();
                    }
                })
            });

            if(this.viewAttrs.reorderable){
                this.$(".prob-list").sortable({handle: ".reorder-handle", forcePlaceholderSize: true,
                                                placeholder: "sortable-placeholder",axis: "y",
                                                stop: this.reorder});
            }
            this.showProperty(this.state.pick("show_path","show_tags","show_hints","show_solution"));
            this.updatePaginator();
            this.updateNumProblems();
            return this;
        },
        /* Clear the problems and rerender */ 
        reset: function (){
            this.problemViews = [];
            this.set({problems: new ProblemList()}).render();
        },
        updateNumProblems: function () {
            var numPerPage = _(this.pages).map(function(page){
               return  _(page).reduce(function(num,obj){ return num + parseInt(obj.leader?1:0);},0); });
            var totalProbs = _(numPerPage).reduce(function(num,page) { return num+page;},0);
            if (totalProbs>0){
                var start = 1,i;
                for(i=0;i<this.state.get("current_page"); i++)
                    start += numPerPage[i];
                end = start-1+numPerPage[this.state.get("current_page")];
                this.$(".num-problems").html(this.messageTemplate({type: "problems_shown", 
                    opts: {probFrom: start, probTo:end,total: totalProbs }}));
            }
        },
        events: {"click .undo-delete-button": "undoDelete",
            "change .display-mode-options": "changeDisplayMode",
            "click #create-new-problem": "openSimpleEditor",
            "click .show-hide-tags-btn": "toggleTags",
            "click .goto-first": "firstPage",
            "click .go-back-one": "prevPage",
            "click .page-button": "gotoPage",
            "click .go-forward-one": "nextPage",
            "click .goto-end": "lastPage"
        },
        clearProblemData : function () {
            this.problems.each(function(problem){
                 problem.set({data: null},{silent:true});
            });
            _(this.problemViews).each(function(pv){ 
                    pv.set({data_fetched: false,display_mode: this.state.get("display_mode")});});
        },
        showProperty: function(_obj){
            var self = this;
            var keys = _(_obj).keys();
            _(keys).each(function(key){
                _(self.pages[self.state.get("current_page")]).each(function(obj,i){ 
                    self.problemViews[i].set(_obj)
                }); 
            });
            return this;
        },
        firstPage: function() { this.state.set("current_page",0);},
        prevPage: function() {
            if(this.state.get("current_page")>0)
                this.state.set("current_page",this.state.get("current_page")-1);
         },
        nextPage: function() {
            if(this.state.get("current_page")<this.pages.length-1)
                this.state.set("current_page",this.state.get("current_page")+1);
         },
        lastPage: function() {this.state.set("current_page",this.pages.length-1);},
        gotoPage: function(arg){
            var page = /^\d+$/.test(arg) ? parseInt(arg,10) : parseInt($(arg.target).text(),10)-1;
            this.state.set("current_page",page);
            return this; 
        }, 
        updatePaginator: function() {
            // render the paginator
            if(! this.pages) { return this;}
            var start =0,
                stop = this.pages.length;
            if(this.pages.length>8){
                start = (this.state.get("current_page")-4 <0)?0:this.state.get("current_page")-4;
                stop = start+8<this.pages.length?start+8 : this.pages.length;
            }
            if(this.pages.length>1){
                var tmpl = _.template($("#paginator-template").html()); 
                this.$(".problem-paginator").html(tmpl({current_page: this.state.get("current_page"),
                                                        page_start:start,            
                                                        page_stop:stop,
                                                        num_pages:this.pages.length}));
            }
            this.$(".problem-paginator button").removeClass("current-page");
            this.$(".problem-paginator button[data-page='" + 
                    this.state.get("current_page") + "']").addClass("current-page");

            return this;
        },
/*            this.updatePaginator();       
            this.renderProblems();
            this.$(".problem-paginator button").removeClass("current-page");
            this.$(".problem-paginator button[data-page='" + this.state.get("current_page") + "']").addClass("current-page");
            this.trigger("page-changed",this.state.get("current_page"));
            return this;
        }, */
        /* when the "new" button is clicked open up the simple editor. */
        openSimpleEditor: function(){  
            console.log("opening the simple editor."); 
        },
        reorder: function (event,ui) {
            var self = this;
            if(typeof(self.problems.problemSet) == "undefined"){
                return;
            }
            this.problems.problemSet.changingAttributes = {"problems_reordered":""};
            this.$(".problem").each(function (i) { 
                self.problems.findWhere({source_file: $(this).data("path")})
                        .set({problem_id: i+1}, {silent: true});  // set the new order of the problems.  
            });   
            this.problems.problemSet.save();
        },
        undoDelete: function(){
            if (this.undoStack.length>0){
                var prob = this.undoStack.pop();
                if(this.problems.findWhere({problem_id: prob.get("problem_id")})){
                    prob.set("problem_id",parseInt(this.problems.last().get("problem_id"))+1);
                }
                this.problems.add(prob);
                this.updatePaginator();
                this.gotoPage(this.state.get("current_page"));
                this.problemSet.trigger("change:problems",this.problemSet);
            }
        },
        setProblemSet: function(_set) {
            this.model = _set; 
            if(this.model){
                this.set({problemSet: this.model, problems: this.model.get("problems")});                
            }
            this.renderProblems();
            return this;
        },
        // when is this called?
        addProblemView: function (prob){
            var probView = new ProblemView({model: prob, type: this.type, viewAttrs: this.viewAttrs});
            this.$("#prob-list").append(probView.el);
            probView.render();
            this.trigger("update-num-problems",
                {number_shown: this.$(".prob-list li").length, total: this.problems.size()});

        },
        // this is called when the problem has been removed from the problemList
        deleteProblem: function (problem){
            var self = this; 
            this.problemSet.changingAttributes = 
                {"problem_deleted": {setname: this.problemSet.get("set_id"), 
                                    problem_id: problem.get("problem_id")}};
            this.problemSet.trigger("change:problems",this.problemSet);
            this.problemSet.trigger("problem-deleted",problem);
            this.undoStack.push(problem);
            this.gotoPage(this.state.get("current_page"));
            this.$(".undo-delete-button").removeAttr("disabled");
        }
    });
	return ProblemListView;
});

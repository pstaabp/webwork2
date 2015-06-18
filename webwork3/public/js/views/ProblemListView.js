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
      *  The this.currentPage stores the value of the page that is currently being rendered.  
      */

    var ProblemListView = Backbone.View.extend({

        initialize: function(options){
            var self = this;
            _.bindAll(this,"render","deleteProblem","undoDelete","reorder","addProblemView");  
            _(this).extend(_(options).pick("settings","problemSet","messageTemplate"));
            this.problems = options.problems ? options.problems : new ProblemList();
            this.problemSet = options.problemSet; 
            this.undoStack = []; // this is where problems are placed upon delete, so the delete can be undone.  
            this.pageSize = 10; // this should be a parameter.
            this.currentPage = 0;
            this.show_tags = false;
            this.show_path = false;
            this.show_hints = false;
            this.show_solution = false;
            this.pages = [];
            _.extend(this.viewAttrs,{type: options.type});
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
                        currentPage.push({leader:true,num:i})
                        if(currentPage.length>self.pageSize){
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
                this.currentPage = opts.current_page || 0;
            }
            _(this).extend(_(opts).pick("show_path","show_tags","show_solution","show_hints"))
            this.viewAttrs.type = opts.type || "set";
            this.viewAttrs.displayMode = (opts.display_mode || this.viewAttrs.displayMode ) ||              
                                            this.settings.getSettingValue("pg{options}{displayMode}");
            this.problemViews = [];
            return this;
        },
        // this function pulls out only the problems to show in the library. 
        sortProblems: function (){
            var self = this; 
            this.pages = [];
            var currentPage = []; 
            //var probNumOnPage = 0; 
            this.problems.each(function(prob,i){
                if(currentPage.length>=self.pageSize && ( prob.get("morelt_id") == 0 || 
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
            this.updatePaginator().gotoPage(this.currentPage || 0);
            if(this.libraryView && this.libraryView.libProblemListView){
                this.libraryView.libraryProblemsView.highlightCommonProblems();
            }
            return this;
        }, 
        renderProblems: function () {
            var self = this;
            var ul = this.$(".prob-list").empty();
            this.problemViews = []; 
            _(this.pages[this.currentPage]).each(function(obj){
                var pv = new ProblemView({model: self.problems.at(obj.num), hidden: !obj.leader,
                                          libraryView: self.libraryView, viewAttrs: self.viewAttrs});
                self.problemViews.push(pv);
                ul.append(pv.render().el); 
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
            this.toggleProperty({show_path: this.show_path});
            this.toggleProperty({show_tags: this.show_tags});
            this.toggleProperty({show_hints: this.show_hints});
            this.toggleProperty({show_solution: this.show_solution});
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
                for(i=0;i<this.currentPage; i++)
                    start += numPerPage[i];
                end = start-1+numPerPage[this.currentPage];
                this.$(".num-problems").html(this.messageTemplate({type: "problems_shown", 
                    opts: {probFrom: start, probTo:end,total: totalProbs }}));
            }
        },
        updatePaginator: function() {
            // render the paginator
            if(! this.pages) { return this;}
            var start =0,
                stop = this.pages.length;
            if(this.pages.length>8){
                start = (this.currentPage-4 <0)?0:this.currentPage-4;
                stop = start+8<this.pages.length?start+8 : this.pages.length;
            }
            if(this.pages.length>1){
                var tmpl = _.template($("#paginator-template").html()); 
                this.$(".problem-paginator").html(tmpl({current_page: this.currentPage, page_start:start,            
                                                        page_stop:stop,num_pages:this.pages.length}));
            }
            return this;
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
        changeDisplayMode: function (_display) {
            this.problems.each(function(problem){
                 problem.set({data: null},{silent:true});
            });
            this.viewAttrs.displayMode = _display; // $(evt.target).val();  Note: this might screw up the ProblemSetDetail View
            this.renderProblems();
        },
        toggleProperty: function(_obj){
            var key = _(_obj).pairs()[0][0];
            var value = _(_obj).pairs()[0][1];
            var self = this;
            this[key] = value; 
            _(this.pages[this.currentPage]).each(function(obj,i){ 
                self.problemViews[i].set(_obj)
            });
            return this;
        },
        firstPage: function() { this.gotoPage(0);},
        prevPage: function() {if(this.currentPage>0) {this.gotoPage(this.currentPage-1);}},
        nextPage: function() {if(this.currentPage<this.pages.length){this.gotoPage(this.currentPage+1);}},
        lastPage: function() {this.gotoPage(this.pages.length-1);},
        gotoPage: function(arg){
            this.currentPage = /^\d+$/.test(arg) ? parseInt(arg,10) : parseInt($(arg.target).text(),10)-1;
            // if the current Page select is beyond the number of pages, reset it. 
            if(this.currentPage >= this.pages.length){
                this.currentPage = 0;
            } 
            this.updatePaginator();       
            this.renderProblems();
            this.$(".problem-paginator button").removeClass("current-page");
            this.$(".problem-paginator button[data-page='" + this.currentPage + "']").addClass("current-page");
            this.trigger("page-changed",this.currentPage);
            return this;
        },
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
                this.gotoPage(this.currentPage);
                this.problemSet.trigger("change:problems",this.problemSet);
            }
        },
        setProblemSet: function(_set) {
            this.model = _set; 
            if(this.model){
                this.set({problemSet: this.model, problems: this.model.get("problems")});                
            }
            return this;
        },
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
            this.gotoPage(this.currentPage);
            this.$(".undo-delete-button").removeAttr("disabled");
        }
    });
	return ProblemListView;
});

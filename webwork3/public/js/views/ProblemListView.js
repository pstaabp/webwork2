define(['jquery','backbone', 'underscore', 'views/ProblemView','config','models/ProblemList'],
    function($,Backbone, _, ProblemView,config,ProblemList){

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
            _.bindAll(this,"render","addProblemView");
            _(this).extend(_(options).pick("settings","problemSet","messageTemplate"));
            this.problems = options.problems ? options.problems : new ProblemList();
            this.problemSet = options.problemSet;
            this.page_size = 10; // this should be a parameter.
            this.pageRange = _.range(this.page_size);
            this.currentPage = 0;
            this.show_tags = false;
            this.show_path = false;
            this.undoStack = []; // this is where problems are placed upon delete, so the delete can be undone.
            this.pages = [];  // this stores the pages as arrays of problems
            this.problemViews = []; // this is the problemView for the viewable set of problems

            _.extend(this.viewAttrs,{type: options.type});
            this.state = new Backbone.Model({show_tags: false, page_size: 10, show_path: false,
                                 show_hints: false, show_solution: false, current_page: 0});
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
            _(this).extend(_(opts).pick("problem_set_view"));
            if(opts.current_page){
                this.state.set("current_page", opts.current_page || 0);
            }
            this.state.set(_(opts).pick("show_path","show_tags","show_solution","show_hints"))
            this.viewAttrs.type = opts.type || "set"; // what is this for?
            this.state.set(_(opts).pick("display_mode"));
            if(_.isEmpty(this.state.get("display_mode"))){
                this.state.set("display_mode",this.settings.getSettingValue("pg{options}{displayMode}"));
                if(this.libraryView){
                    this.libraryView.parent.state.set("display_mode",this.state.get("display_mode",{silent: true}));
                } else if(this.problem_set_view){
                    this.problem_set_view.state.set("display_mode",this.state.get("display_mode",{silent: true}));
                }
            }
            return this;
        },
        // this function pulls out only the problems to show in the library.
        sortProblems: function (){
            var self = this;
            this.pages = [];
            var currentPage = [];
            var problems_added = 0;
            //var probNumOnPage = 0;
            this.problems.each(function(prob,i){

                if(prob.get("morelt_id")==0 || prob.get("mlt_leader")){
                    problems_added++;
                    currentPage.push({leader:true,num:i})
                } else {
                    currentPage.push({leader:false,num:i});
                }
                if(problems_added >=self.state.get("page_size")){
                    self.pages.push(currentPage);
                    currentPage = [];
                    problems_added = 0;
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
                                                        viewAttrs: self.viewAttrs, edit_tags: self.editTags,
                                                        display_mode: self.state.get("display_mode") }));
            });

            return this;
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
                pv.delegateEvents();
            });

            if(this.viewAttrs.reorderable){
                this.$(".prob-list").sortable({handle: ".reorder-handle", forcePlaceholderSize: true,
                                                placeholder: "sortable-placeholder",axis: "y",
                                                stop: this.reorder});
            }
<<<<<<< HEAD
            this.showProperty(this.state.pick("show_path","show_tags","show_hints","show_solution"));
=======
            // check if all of the problems are rendered.  When they are, trigger an event
            //
            // I think this needs work.  It appears that MathJax fires lots of "Math End" signals,
            // although why not just one.
            //
            // this may also be part of the many calls to render throughout the app.
            // (Note: after further work on another branch, this may not be necessary)

            _(this.problemViews).each(function(pv){
                if(pv && pv.model){
                      pv.model.on("rendered", function () {
                          if(_(self.problemViews).chain().map(function(pv){
                               if(pv) {
                                    return pv.state.get("rendered");}
                                }).every().value()){
                            self.trigger("rendered");
                          }
                      });
                }
            })
            this.showPath(this.show_path);
            this.showTags(this.show_tags);
>>>>>>> ww3-feature/editor
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
<<<<<<< HEAD
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

            var num_problem_row_height = $(".num-problems").parent().outerHeight(true);
            var tab_height = $(".set-details-tab").parent().outerHeight(true);
            var navbar_height = $(".navbar-fixed-top").outerHeight(true);
            var footer_height = $(".navbar-fixed-bottom").outerHeight(true);
            this.$(".prob-list").height($(window).height()-num_problem_row_height-tab_height
                                                -navbar_height-footer_height);

=======
            if (this.problems.size()>0){
                this.$(".num-problems").html(this.messageTemplate({type: "problems_shown",
                    opts: {probFrom: (this.pageRange[0]+1), probTo:(_(this.pageRange).last() + 1),
                         total: this.problems.size() }}));
            }
        },
        updatePaginator: function() {
            // render the paginator

            this.maxPages = Math.ceil(this.problems.length / this.page_size);
            var start =0,
                stop = this.maxPages;
            if(this.maxPages>8){
                start = (this.currentPage-4 <0)?0:this.currentPage-4;
                stop = start+8<this.maxPages?start+8 : this.maxPages;
            }
            if(this.maxPages>1){
                var tmpl = _.template($("#paginator-template").html());
                this.$(".problem-paginator").html(tmpl({current_page: this.currentPage, page_start:start,
                                                        page_stop:stop,num_pages:this.maxPages}));
            }
            return this;
>>>>>>> ww3-feature/editor
        },
        events: {
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
<<<<<<< HEAD
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
=======
            this.currentPage = /^\d+$/.test(arg) ? parseInt(arg,10) : parseInt($(arg.target).text(),10)-1;
            this.pageRange = this.page_size >0 ? _.range(this.currentPage*this.page_size,
                (this.currentPage+1)*this.page_size>this.problems.size()? this.problems.size():(this.currentPage+1)*this.page_size)
                    : _.range(this.problems.length);
            this.updatePaginator();
            this.renderProblems();
>>>>>>> ww3-feature/editor
            this.$(".problem-paginator button").removeClass("current-page");
            this.$(".problem-paginator button[data-page='" +
                    this.state.get("current_page") + "']").addClass("current-page");

            return this;
        },
        /* when the "new" button is clicked open up the simple editor. */
        openSimpleEditor: function(){
            console.log("opening the simple editor.");
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
          // check to see if the problem has already been added
          var pv = _(this.problemViews).filter(function(_pv){
            return _pv.model.get("problem_id") == prob.get("problem_id")
          });
          if(pv.length>0){
            return;
          }
          if((!_.isUndefined(this.viewAttrs.type) && this.viewAttrs.type === "set") || this.pageRange.length < this.page_size){
              var probView = new ProblemView({model: prob, problem_set_view: this.problem_set_view,
                                              type: this.type, viewAttrs: this.viewAttrs});
              var numViews = this.problemViews.length;
              probView.render().$el.data("id",this.model.get("set_id")+":"+(numViews+1));
              probView.model.set("_id", this.model.get("set_id")+":"+(numViews+1));
              this.$(".prob-list").append(probView.el);
              this.problemViews.push(probView);
              this.pageRange.push(_(this.pageRange).last() +1);
          }
          this.updateNumProblems();
        },
    });
	return ProblemListView;
});

define(['jquery','backbone', 'underscore', 'views/ProblemView',
        'config','models/ProblemList','apps/util'],
    function($,Backbone, _, ProblemView,config,ProblemList,util){

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

            this.problems.on("change",function(){
              console.log("hi");
            })
        },
        set: function(opts){
            var self = this;
            if(opts.problems){
                this.problems = opts.problems;
                this.buildPaginator();
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
            if(this.paginator){
              this.$(".problem-paginator").append(this.paginator.render().el);
            }

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

          this.showProperty(this.state.pick("show_path","show_tags","show_hints","show_solution"));

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
                  if(pv) {return pv.state.get("rendered");}}).every().value()){
                    self.trigger("rendered");
                  }
              });
            }
          })
          this.updateNumProblems();
          return this;
        },
        /* Clear the problems and rerender */
        reset: function (){
            this.problemViews = [];
            this.set({problems: new ProblemList()}).render();
        },
        updateNumProblems: function () {
          if (this.problems.size()>0){
            var from = this.pageRange[0]+1;
            var to = _(this.pageRange).last()+1>this.problems.size()?this.problems.size():
                      _(this.pageRange).last()+1;
              this.$(".num-problems").html(this.messageTemplate({type: "problems_shown",
                opts: {probFrom: from, probTo:to, total: this.problems.size() }}));
          }
        },
        // updateCurrentPage: function(_model){
        //   currentPage = _model.get("current_page");
        //   this.state.set({current_page: currentPage});
        //   this.pageRange = this.page_size >0 ? _.range(currentPage*this.page_size,
        //           (currentPage+1)*this.page_size>this.problems.size()? this.problems.size():(currentPage+1)*this.page_size)
        //               : _.range(this.problems.length);
        //   this.renderProblems();
        // },
        buildPaginator: function() {
            // render the paginator
            this.paginator = new PaginatorView({page_size:10, num_problems: this.problems.size(),
                current_page: this.state.get("current_page")}).render();
            this.$(".problem-paginator").html(this.paginator.el);

            var currentPage = this.state.get("current_page");
            this.pageRange = this.page_size >0 ? _.range(currentPage*this.page_size,
                    (currentPage+1)*this.page_size>this.problems.size()? this.problems.size():(currentPage+1)*this.page_size)
                        : _.range(this.problems.length);

            //this.listenTo(this.paginator.model, 'change:current_page', this.updateCurrentPage);
            return this;
        },
        events: {
            "change .display-mode-options": "changeDisplayMode",
            "click #create-new-problem": "openSimpleEditor",
            "click .show-hide-tags-btn": "toggleTags",
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

    var PaginatorView = Backbone.View.extend({
      tagName: "ul",
      className: "pagination pagination-sm",
      initialize: function(options){
        var self = this;
        this.model = new Backbone.Model();
        this.model.on("change:current_page change:num_pages",function(){
          if(self.model.get("num_pages")<10){
            self.model.set({first_page:1, last_page: self.model.get("num_pages")});
            return;
          }
          self.model.set({first_page: self.model.get("current_page")<5?1:self.model.get("current_page")-4});
          self.model.set({last_page: self.model.get("num_pages")-self.model.get("current_page")<4?
                          self.model.get("num_pages"): self.model.get("first_page")+8});
          if(self.model.get("last_page")>self.model.get("num_pages") ||
              self.model.get("first_page")+8 > self.model.get("num_pages")){
            self.model.set({
              last_page: self.model.get("num_pages"),
              first_page: self.model.get("num_pages")<8?1:self.model.get("num_pages")-8});
          }
        });
        this.model.set(_(options).pick("num_problems","page_size","current_page"));
        this.model.set({num_pages: Math.ceil(this.model.get("num_problems")
                                    / this.model.get("page_size"))});

      },
      render: function(){
          this.$el.html("");
          var first_page,last_page,num_pages = this.model.get("num_pages");
          this.$el.append(new PaginatorButton({button_name: "first"}).render().el);
          this.$el.append(new PaginatorButton({button_name: "left"}).render().el);
          this.$el.append(new PaginatorButton({button_name: "dots"}).render().el);

          for(var i = this.model.get("first_page"), num = 1; i<=this.model.get("last_page"); i++, num++){
            this.$el.append(new PaginatorButton({button_number: num, button_text: i}).render().el);
          }
          this.$el.append(new PaginatorButton({button_name: "dots"}).render().el);
          this.$el.append(new PaginatorButton({button_name: "right"}).render().el);
          this.$el.append(new PaginatorButton({button_name: "last"}).render().el);
          return this.decorate();
      },
      decorate: function(){
        var self = this;
        if(this.model.get("current_page")+1>this.model.get("num_pages")){
          this.model.set({current_page: 0});
        }
        this.$("li.page-item").removeClass("active").removeClass("disabled");
        if(this.model.get("current_page")==0){
          this.$("li.page-item:nth-child(1)").addClass("disabled");
          this.$("li.page-item:nth-child(2)").addClass("disabled");
        } else if(this.model.get("current_page")+1==this.model.get("num_pages")){
          this.$("li.page-item:nth-last-child(1)").addClass("disabled");
          this.$("li.page-item:nth-last-child(2)").addClass("disabled");
        }

        this.$("li.page-item:nth-child(3)").removeClass("hidden");
        for(var i=this.model.get("first_page"),n=1;i<=this.model.get("last_page");i++,n++){
          this.$("a[data-number='"+n+"']").text(i).attr("data-text",i);
        }


        util.changeClass({els: this.$("li.page-item:nth-child(3)"), add_class: "hidden",
          state: this.model.get("first_page")==1});
        util.changeClass({els: this.$("li.page-item:nth-last-child(3)"), add_class: "hidden",
          state: this.model.get("last_page")==this.model.get("num_pages")});


        this.$("a[data-text='"+(this.model.get("current_page")+1)+"']").parent().addClass("active");
        return this;
      },
      events: {
        "click .goto-first": "firstPage",
        "click .go-back-one": "prevPage",
        "click .page-number": "gotoPage",
        "click .go-forward-one": "nextPage",
        "click .goto-end": "lastPage"
      },
      firstPage: function(evt){
        this.model.set({current_page:0});
        this.decorate();
      },
      lastPage: function(evt){
        this.model.set({current_page: this.model.get("num_pages")-1});
        this.decorate();
      },
      prevPage: function(evt){
        this.model.set({current_page: this.model.get("current_page")-1});
        this.decorate();
      },
      nextPage: function(evt){
        this.model.set({current_page: this.model.get("current_page")+1});
        this.decorate();
      },
      gotoPage: function(evt){
        this.model.set({current_page: parseInt($(evt.target).text())-1})
        this.decorate();
      }
    });

    var PaginatorButton = Backbone.View.extend({
      tagName: "li",
      className: "page-item",
      initialize: function(options){
        _(this).extend(options);
      },
      render: function(){

        this.$el.html("<a href='#' onclick='return false' class='page-link'><i class='fa'></i></a>")
        var icon = this.$("i")
        if(this.button_name=="first"){
          icon.addClass("fa-step-backward");
          icon.parent().addClass("goto-first");
        } else if (this.button_name=="left"){
          icon.addClass("fa-arrow-left");
          icon.parent().addClass("go-back-one");
        } else if (this.button_name=="right"){
          icon.addClass("fa-arrow-right");
          icon.parent().addClass("go-forward-one");
        } else if (this.button_name=="last"){
          icon.addClass("fa-step-forward");
          icon.parent().addClass("goto-end");
        } else if (this.button_name=="dots"){
          icon.parent().text("...");
        } else if(this.button_text){
          icon.parent().addClass("page-number").text(this.button_text)
            .attr("data-number",this.button_number)
            .attr("data-text",this.button_text);
        }
        return this;
      }
    });

	return ProblemListView;
});

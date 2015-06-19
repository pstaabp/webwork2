define(['backbone', 'underscore','config','models/Problem','imagesloaded','knowl'], function(Backbone, _,config,Problem){
    //##The problem View

    //A view defined for the browser app for the webwork Problem model.
    //There's no reason this same view couldn't be used in other pages almost as is.

    /* the view attributes are as follows:
    
        reorderable (boolean): whether the reorder arrow should be shown
        showPoints (boolean): whether the # of points should be shown
        showAddTool (boolean): whether the + should be shown to be added to a problemSet
        showEditTool (boolean): whether the edit button should be shown
        showViewTool (boolean): whether the show button should be shown (to be taken to the userSetView )
        showRefreshTool (boolean): whether the refresh button should be shown (for getting a new random problem)
        showHideTool (boolean): whether the hide button (X) should be shown to hide the problem
        deletable (boolean): is the problem deletable from the list its in.       
        draggable (boolean): can the problem be dragged and show the drag arrow (for library problems)
        display_mode (boolean): the PG display mode for the problem (images, MathJax, none)

        "tags_loaded", "tags_shown", "path_shown",

    */

    var ProblemView = Backbone.View.extend({
        //We want the problem to render in a `li` since it will be included in a list
        tagName:"li",
        className: "problem",
        template: _.template($('#problem-template').html()),
        initialize:function (options) {
            var self = this;
            _.bindAll(this,"render","removeProblem","showPath","showTags");
            this.libraryView = options.libraryView;
            if(typeof(this.model)==="undefined"){
                this.model = new Problem();
            }   

            // the this.state will store information about the state of the problem
            // including whether or not tags or path is shown as well as view attributes
            // which include which tools are shown on a problemView

            this.state = new Backbone.Model(_.extend(options.viewAttrs,
                        {tags_loaded: false, tags_shown: false, path_shown: false, data_fetched: false}));
                
            this.state.on("change:show_tags",function(){
                    self.showTags(self.state.get("show_tags"));
            }).on("change:show_path",function(){
                self.showPath(self.state.get("show_path"));
            }).on("change:show_mlt",function(){
                self.showMLT(self.state.get("show_mlt"));
            }).on("change:hidden",function() {
                config.changeClass({state: self.state.get("hidden"), els: self.$el, add_class: "hidden"});
                if(!self.state.get("hidden")){
                    self.render();
                }
            })
            
            this.state.set(_(options).pick("display_mode","hidden"));
                    
            this.model.on('change:value', function () {
                if(self.model.get("value").match(/^\d+$/)) {
                    self.model.save();
                }
            }).on("change:show_hints",function(){
                self.showHints(self.model.get("show_hints"));
            }).on("change:show_solution",function(){
                self.showSolution(self.model.get("show_solution"));
            });
        },

        render:function () {
            var self = this;
            if(this.model.get('data') || this.state.get("display_mode")=="None"){
            
                if(this.state.get("display_mode")=="None"){
                    this.model.attributes.data="";
                }

                this.$el.html(this.template(_.extend({},this.model.attributes,this.state.attributes)));
                
                this.$el.imagesLoaded(function() {
                    self.$el.removeAttr("style");
                    self.$(".problem").removeAttr("style");
                    self.$(".loading").remove();
                });


                if (this.state.get("draggable")) {
                    this.$el.draggable({
                        helper:'clone',
                        revert:true,
                        handle:'.drag-handle',
                        appendTo:'body',
                    }); 

                } 

                this.el.id = this.model.cid; // why do we need this? 
                this.$el.attr('data-path', this.model.get('source_file'));
                this.$el.attr('data-source', this.state.get("type"));
                if (this.state.get("display_mode")==="MathJax"){
                    MathJax.Hub.Queue(["Typeset",MathJax.Hub,this.el]);
                }
                this.showPath(this.state.get("show_path"));
                this.showTags(this.state.get("show_tags"));
                this.stickit();
                this.model.trigger("rendered",this);
                this.state.set("rendered",true);                
            } else if (! this.state.get("hidden")) {
                this.state.set("rendered",false);
                this.$el.html($("#problem-loading-template").html());
                if(!this.state.get("data_fetched")){
                    this.state.set("data_fetched",true);    
                    this.model.loadHTML({display_mode: this.state.get("display_mode"), success: function (data) {
                        self.model.set("data",data.text);
                        self.model.renderData = data;
                        self.state.set("mlt_leader",self.model.get("mlt_leader"));
                        if(self.model.renderData.tags){ // if the tags were retrieved upon rendering. 
                            self.model.set(self.model.renderData.tags);
                            self.state.set('tags_loaded',true);
                        }
                        self.render();
                    }, error:function(data){
                        self.model.set("data",data.responseText);
                        self.render();
                    }});
                }
            }


            return this;
        },
        events: {
            "click .hide-problem": "hideProblem",
            "click .remove-problem": "removeProblem",
            "click .refresh-problem": 'reloadWithRandomSeed',
            "click .add-problem": "addProblem",
            "click .seed-button": "toggleSeed",
            "click .mlt-button": function () {this.state.set("show_mlt",!this.state.get("show_mlt"))},
            "click .path-button": function () {this.state.set("show_path",!this.state.get("show_path"))},
            "click .tags-button": function () {this.state.set("show_tags",!this.state.get("show_tags"))}
        },
        bindings: {".prob-value": "value",
            ".mlt-tag": "morelt",
            ".level-tag": "level",
            ".keyword-tag": "keyword",
            ".problem-author-tag": "author",
            ".institution-tag": "institution",
            ".tb-title-tag": "textbook_title",
            ".tb-chapter-tag": "textbook_chapter",
            ".tb-section-tag": "textbook_section",
            ".DBsubject-tag": "subject",
            ".DBchapter-tag": "chapter",
            ".DBsection-tag": "section",
            ".problem-path": "source_file",
            ".seed": "problem_seed"
        },
        reloadWithRandomSeed: function (){
            var seed = Math.floor((Math.random()*10000));
            console.log("reloading with new seed " + seed);
            this.model.set({data:"", problem_seed: seed});
            this.state.set({rendered: false, data_fetched: false});
            this.render();
        },
        showPath: function (_show){
            config.changeClass({state: _show, els: this.$(".path-row"), remove_class: "hidden"});
        },
        showTags: function (_show){
            config.changeClass({state: _show, els: this.$(".tag-row"), remove_class: "hidden"});
        },
        showHints: function(_show){
            this.model.set({show_hints: _show, data: ""});
            this.state.set({rendered: false, data_fetched: false});
            this.render();
        },
        showSolution: function(_show){
            this.model.set({show_solution: _show, data: ""});
            this.state.set({rendered: false, data_fetched: false});
            this.render();
        },
        showMLT: function(_show){
            this.$(".mlt-button").html(_show?"L":"M");
            this.libraryView.libraryProblemsView.showMLT(this.model,_show);
        },
        toggleSeed: function () {
            this.$(".problem-seed").toggleClass("hidden");
        },
        addProblem: function (evt){
            if(this.libraryView){
                this.libraryView.addProblem(this.model);  
            } else {
                console.error("This is not an addable problem.")
            }
        },
        highlight: function(turn_on){
            if(turn_on){
                this.$(".highlight-problem").removeClass("hidden")
            } else {
                this.$(".highlight-problem").addClass("hidden")
            }
        },
        hideProblem: function(evt){
            this.$el.addClass("hidden");
        },
        removeProblem: function(){
            this.model.collection.remove(this.model);
            this.remove();  // remove the view
        }, 
        set: function(opts){
            this.state.set(_(opts).pick("show_path","show_tags","tags_loaded","display_mode","data_fetched"));
            this.model.set(_(opts).pick("data","show_hints","show_solution"));
            return this;
        }
    });

    return ProblemView;
});
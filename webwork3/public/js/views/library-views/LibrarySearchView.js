/*
*  This is the a view of an interface to search the problem library
*
*
*/


define(['jquery','backbone', 'underscore','views/library-views/LibraryView','models/ProblemList','config'],
function($,Backbone, _,LibraryView,ProblemList,config){
    var LibrarySearchView = LibraryView.extend({
        className: "lib-browser",
        tabName: "Search",
    	initialize: function (options){
            LibraryView.prototype.initialize.apply(this,[options]);
            _.bindAll(this,"search","showResults","checkForEnter");
            this.tabState.on("change:search_query",this.search);
            this.fields = ["level","institution","author","subject","chapter","section","keyword"];
    	},
        bindings: {
            ".search-query": {observe: "search_query", events: ["blur"]}
        },
        events: function(){
            return _.extend({},LibraryView.prototype.events,{
                "click .search-button": "search",
                "keyup .search-query": "checkForEnter"
            });
        },
    	render: function (){
            this.$el.html($("#library-search-template").html());
            this.libraryProblemsView.setElement(this.$(".problems-container")).render();
            this.stickit(this.tabState,this.bindings);
            this.libraryProblemsView.render();

            return this;
    	},
        search: function () {
            var params = {};
            var self = this;
            var searches = this.tabState.get("search_query").match(/^\s*(.*)\s*$/)[1].split(/\s+and\s*/i);
            var valid = true;
            var error = "";
            _(searches).each(function(term){
                var comps = term.split(":");
                if(comps.length!=2){
                    valid = false;
                    error = "This isn't a valid search";
                }
                if(self.fields.indexOf(comps[0]) < 0){
                    valid = false;
                    error = "The term " + comps[0] + " is not a searchable field.";
                }
                if(comps[1]===""){
                    valid = false;
                    error = "Put a searchable term after " + comps[0] + ":";
                }
                params[comps[0]]=comps[1];
            });

            if(_(params).has("keyword")){
                params.keyword = "%" + params.keyword + "%";
            }


            if(valid){
                this.$(".search-button").bootstrapBtn("loading");
                $.get(config.urlPrefix + "library/problems", params, this.showResults);
                this.$(".search-query").parent().removeClass("has-error");
            } else {
                this.$(".search-query").popover({title: "Error", content: error , placement: "top"}).popover("show");
                this.$(".search-query").parent().addClass("has-error");
            }
        },
        showResults: function (data) {
            this.$(".search-button").bootstrapBtn("reset");
            this.problemList = new ProblemList(data);
            this.$(".num-problems").text(this.problemList.length + " problems");
            this.showProblems();
        },
        checkForEnter: function(evt){
            if (evt.keyCode==13){
                $(evt.target).blur();
            }
        }

    });

    return LibrarySearchView;
});

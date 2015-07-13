/**
 * This is the view of displaying any problems in the library.  It is a ProblemListView with some additional 
 * functionality including highlighting problems from the library that are in the target set.  
 *
 **/


define(['backbone', 'views/ProblemListView','config'], 
function(Backbone, ProblemListView,config) {
    var LibraryProblemsView = ProblemListView.extend({
        initialize: function (options) {
            _(this).bindAll("highlightCommonProblems");
            this.viewAttrs = {reorderable: false, showPoints: false, showAddTool: true, 
                              showEditTool: false, problem_seed: 1, showRefreshTool: true, 
                              showViewTool: false, showHideTool: true, deletable: false, 
                              showMaxAttempts: false, draggable: true, markCorrect: true};
            _.extend(this,_(options).pick("problemSets","libraryView","settings","type"));
            ProblemListView.prototype.initialize.apply(this,[options]); 
        },
        render: function(){
            var self = this; 
            this.state.set(this.libraryView.parent.state.pick("display_mode","show_hints","show_solution",
                                                                "show_path","show_tags"));
            ProblemListView.prototype.render.apply(this);
            // not sure this is needed right now
            this.libraryView.libraryProblemsView.on("page-changed",this.highlightCommonProblems);
            this.highlightCommonProblems();
            this.$(".prob-list-container").height($(window).height()-((this.maxPages==1) ? 200: 250));
            return this;
        },
        showMLT: function(_model,_show){
            var self = this; 
            var pvs = _(this.problemViews).filter(function(pv){   
                        return pv.model.get("morelt_id")==_model.get("morelt_id");})
            _(pvs).each(function(pv,i) { 
                if(i>0) {
                    pv.state.set("hidden", !_show);
                    //config.changeClass({state: _show, els: pv.$el, remove_class: "hidden"}); 
                }
                if(i>0 && i<pvs.length-1){
                    util.changeClass({state: _show, els: pv.$el, 
                                    add_class: "mlt-middle", remove_class: "problem"}); 
                }
            }); 
            util.changeClass({state: _show, els: pvs[0].$el,
                                add_class: "mlt-top", remove_class: "problem"});
            util.changeClass({state:  _show, els: pvs[pvs.length-1].$el,
                                add_class: "mlt-bottom", remove_class: "problem"});
            this.highlightCommonProblems();
            
        },
        highlightCommonProblems: function () {
            var self = this;
            if(this.libraryView.parent.state.get("target_set_id") && this.pages){ 
                var pathsInTargetSet = this.libraryView.problemSets
                            .findWhere({set_id: this.libraryView.parent.state.get("target_set_id")})
                            .problems.pluck("source_file");
                var visiblePaths = _(this.pages[this.currentPage]).map(function(p) { 
                                            return self.problems.at(p.num).get("source_file");}); 
                var pathsInLibrary = this.problems.pluck("source_file");
                var pathsInCommon = _.intersection(pathsInLibrary,pathsInTargetSet);
                
                _(this.problemViews).chain(). filter(function(pv){
                        return pathsInCommon.indexOf(pv.model.get("source_file"))>-1})
                        .map(function(pv) {
                                    if(pv.state.get("rendered")){
                                        pv.highlight(true);
                                    } else {
                                        pv.model.once("rendered", function(v) {
                                            v.highlight(true);
                                        });
                                    }
                }); 

            } 
            return this;
        }
    });

    return LibraryProblemsView;
});

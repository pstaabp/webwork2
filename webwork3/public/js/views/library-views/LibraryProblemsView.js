define(['jquery','backbone', 'views/ProblemListView','config'],
    function($,Backbone, ProblemListView,config) {
    	var LibraryProblemsView = ProblemListView.extend({
    		initialize: function (options) {
                _(this).bindAll("highlightCommonProblems");
	            this.viewAttrs = {
                    reorderable: false, showPoints: false, showAddTool: true, showEditTool: true,
                    problem_seed: 1, showMaxAttempts: false, showRefreshTool: true, showViewTool: true,
                    showHideTool: true, deletable: false, draggable: true, markCorrect: false};
                _.extend(this,_(options).pick("problemSets","libraryView","settings","type"));
                ProblemListView.prototype.initialize.apply(this,[options]);
    		},
            render: function(){
                this.libraryView.libraryProblemsView.set({current_page: this.libraryView.tabState.get("page_num")});
                ProblemListView.prototype.render.apply(this);
                this.libraryView.libraryProblemsView.on("page-changed",this.highlightCommonProblems);
                this.highlightCommonProblems();
                this.$(".prob-list-container").height($(window).height()-((this.maxPages==1) ? 200: 250));
                return this;
            },
        //     highlightCommonProblems: function () {
        //         var self = this;
        //         if(this.libraryView.targetSet){
        //             var pathsInTargetSet = this.libraryView.problemSets.findWhere({set_id: this.libraryView.targetSet})
        //                 .problems.pluck("source_file");
        //             var pathsInLibrary = this.problems.pluck("source_file");
        //             var pathsInCommon = _.intersection(pathsInLibrary,pathsInTargetSet);
        //             if(this.problemViews){
        //                 _(this.pageRange).each(function(i){
        //                     var pv = self.problemViews[i];
        //                     if(pv.rendered){
        //                         pv.highlight(_(pathsInCommon).contains(pathsInLibrary[i]));
        //                     } else {
        //                         pv.model.once("rendered", function(v) {
        //                             pv.highlight(_(pathsInCommon).contains(pathsInLibrary[i]));
        //                         });
        //                     }
        //                 });
        //             }
        //         }
        //         if(i>0 && i<pvs.length-1){
        //             util.changeClass({state: _show, els: pv.$el,
        //                             add_class: "mlt-middle", remove_class: "problem"});
        //         }
        //     }
        //     util.changeClass({state: _show, els: pvs[0].$el,
        //                         add_class: "mlt-top", remove_class: "problem"});
        //     util.changeClass({state:  _show, els: pvs[pvs.length-1].$el,
        //                         add_class: "mlt-bottom", remove_class: "problem"});
        //     this.highlightCommonProblems();
        //
        // },
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
//        },
//        editTags: function (model){
//            var self = this;
//            $.ajax({
//                url: config.urlPrefix + 'library/problems/0/tags',
//                data: _.extend({course_id: config.courseSettings.course_id}, model.pick("source_file")),
//                success: function(data) {
//                    self.editTagView.set({model: new ProblemTags(data)})
//                            .setElement($(".edit-tags-container")).render();
//                }});
//        }
    });

    return LibraryProblemsView;
});

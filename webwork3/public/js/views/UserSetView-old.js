/**
This is the basic View for a User Set.  Once the UserSet in initialized, the set can be viewed by 
 1) calling .set({model: _set})
 2) then render()

 or .set({model: _set}).render()

**/


define(['module','backbone', 'underscore','config','models/UserProblemList','models/UserProblem','views/ProblemView',
        'models/PastAnswerList','models/PastAnswer','moment','sidebars/UserSetOptions','apps/util'], 
function(module,Backbone, _, config,UserProblemList,UserProblem,ProblemView,PastAnswerList,PastAnswer,
          moment,UserSetOptions,util){

var UserSetView = Backbone.View.extend({
	initialize: function(options){
        this.userProblemListView = new UserProblemListView({parent: this});
        this.userProblemView = new UserProblemView();
        _(this).extend(Backbone.Events); 
        _(this).extend(_(options).pick("problem_number")); 
	},
	render: function(){
        var self = this;
        this.$el.html($("#user-set-view-template").html());
		if(this.userSet){
            if(this.session.permission >0 || moment.unix(this.userSet.get("answer_date")).isBefore(moment())){
                this.$(".show-answer-button").removeClass("hidden");
            } else {
                this.$(".show-answer-button").addClass("hidden");
            }
            this.userProblemListView.setElement(this.$("#problem-list")).render();
            this.userProblemView.setElement(this.$(".problem-container")).set({userSet: this.userSet}).render();            
        }
	},
	set: function(options){
        var self = this;
        _(this).extend(_(options).pick("sidebar","userSet","session"));
        if(options.problem_number){
            this.problem_number = options.problem_number;
        }
        
        if(this.userSet){
            this.currentProblem = this.problem_number ? 
                this.userSet.get("problems").findWhere({"problem_id": this.problem_number+""}) : this.userSet.get("problems").at(0); 
            if(this.sidebar && this.sidebar instanceof UserSetOptions){
                this.sidebar.set({userSet: this.userSet});    
            }
            this.userProblemListView.set({collection: this.userSet.problems})
                .changeProblem(this.currentProblem.get("problem_id")); 
            //this.userProblemView.set({model: this.currentProblem}); 
        }
        this.render();
        

		return this;
	},
    changeProblem: function(_num){
        this.currentProblem = this.userSet.get("problems").findWhere({problem_id: _num+""});
        this.trigger("problem-changed",_num);
        this.problem_number = _num; 
        this.userProblemView.set({model: this.currentProblem}); 
        this.lastAnswerShown = false;
        this.showAnswers = true;
        
        return this;
    },
    
});
    
var UserProblemView = Backbone.View.extend({
    initialize: function(opts){
        this.problemViewAttrs = {showTools: false, displayMode: "MathJax"};
        this.problemView = new ProblemView({model: this.model,viewAttrs: this.problemViewAttrs});
        _(this).bindAll("postCheckAnswer","postSubmitAnswer","showLastAnswer");
        this.allPastAnswers = {};
    },
    render: function () {
        if(_.isUndefined(this.problemView.model)) { return this;}
        this.$el.html($("#user-problem-template").html());
        this.$("ul").html(this.problemView.render().el); 
        if(this.userSet){
            util.changeClass({state: moment().isBefore(moment.unix(this.userSet.get("due_date"))), 
                                    els: this.$(".submit-answer-button"), remove_class: "hidden"});
            util.changeClass({state: moment().isBefore(moment.unix(this.userSet.get("due_date"))), 
                                    els: this.$(".check-answer-button"), add_class: "hidden"});
        }
        this.stickit(this.problemView.model,this.bindings);

        return this;
    },
    bindings: { "#user-set-view-messages": {observe: "problem_result", onGet: function(val){
        return (val && val.msg) ? val.msg : "";
    }}},
    events: {
		"click .preview-answer-button": "previewAnswer",
		"click .check-answer-button": "checkAnswer",
		"click .submit-answer-button": "submitAnswer",
        "click .show-answer-button": "showHideAnswers"
    },
    set: function(opts){
        this.problemView.set(_(opts).pick("model"));
        _(this).extend(_(opts).pick("userSet")); 
        return this.render();
    },
    decorateInputs: function (){
        if(this.problemDecorated){ return;}
        // build decorations around answers
        this.$("[id^='AnSwEr']").each(function(i,elem){
            $(elem).wrap("<span class='alert' style='padding:7px 5px 7px 7px'></span>")
                .parent().after("<i class='fa fa-2x " + $(elem).attr("id") + "'></i>")
        });

        this.problemDecorated = true;

    },
    checkAnswer: function(){
    	this.$(".check-answer-button").button("loading");
    	this.problemView.model.checkAnswers(this.parseAnswers(),this.postCheckAnswer);
    },
    submitAnswer: function(){
    	this.$(".submit-answer-button").button("loading");
    	this.problemView.model.submitAnswers(this.parseAnswers(),this.postSubmitAnswer);
        console.log(this.problemView.model.get("problem_id"));
        delete this.allPastAnswers[this.problemView.model.get("problem_id")];
        this.loadPastAnswers();
    },
    /* This method shows whether an answer is right or wrong by putting a red or green box around the answer
    *  It expected an array of objects with keys id, score (0 or 1) and answer ()
    *
    *  In addition, if there are answers previously, then they are filled in
    */
    denoteRightWrong: function(answers){
        var self = this;
    	_(answers).each(function(ans){
            var elem; 
            if(self.$("#"+ans.id).is("input") && self.$("#"+ans.id).attr("type").toLowerCase()==="radio"){
                elem = self.$("[name='"+ans.id+"'][value='"+ans.answer+"']");
                elem.prop("checked",true);
            } else {
                elem = self.$("#"+ans.id).val(ans.answer);
            }
        
         	if (parseInt(ans.score)===0){
	    		elem.closest("span").removeClass("alert-success").addClass("alert-danger");
                self.$("i."+ans.id).removeClass("a-thumbs-o-up").addClass("fa-thumbs-o-down");
	    	} else if (parseInt(ans.score)===1){
	    		elem.closest("span").removeClass("alert-danger").addClass("alert-success");
                self.$("i."+ans.id).removeClass("fa-thumbs-o-down").addClass("fa-thumbs-o-up");
	    	}
    	});
    },
    showHideAnswers: function () {
        var self = this;
        if(this.showAnswers){

            $.ajax({
                type: "GET",
                url: config.urlPrefix + "renderer/courses/"+config.courseSettings.course_id
                    +"/users/"+this.userSet.get("user_id")+"/sets/"+this.userSet.get("set_id")+"/problems/"
                    + this.currentProblem.get("problem_id"),
                data: {show_answers: 1},
                success: function(data){
                    self.$(".show-answer-button").button("hide");
                    self.displayAnswers(data.answers);
                }
            })
        } else {
            this.$(".show-answer-button").button("reset");
            _(this.problemView.model.renderData.flags.ANSWER_ENTRY_ORDER).each(function(id){
                $("#"+id).popover("hide");
            })
        }
        this.showAnswers = !this.showAnswers;

    },
    previewAnswer: function(){
        this.problemView.model.checkAnswers(this.parseAnswers(),this.postPreviewAnswer);
    },
    parseAnswers: function (){
    	var ansIDs = this.problemView.model.renderData.flags.ANSWER_ENTRY_ORDER;

    	var answers = {};
    	_(ansIDs).each(function(id){
    		if($("#"+id).is("select")){
    			answers[id] = $("#"+id).val();
    		} else if ($("#"+id).is("input")){
	    		switch($("#"+id).attr("type").toLowerCase()){
	    			case "radio": 
	    				answers[id] = $("input[name='"+id+"']:checked").val();
	    				break;
	    			case "text":
	    				answers[id] = $("#"+id).val(); 
	    				break;
	    		}
	    	}
    	})
    	return answers; 
    },
    displayAnswers: function(answers){
        _(this.problemView.model.renderData.flags.ANSWER_ENTRY_ORDER).each(function(id){
            $("#"+id).popover("destroy")
                .popover({title: "Correct Answer", content: answers[id].correct_ans}).popover("show");
        })
    },
    loadPastAnswers: function(data){
        if(! this.allPastAnswers[this.problemView.model.get("problem_id")] ){
            this.allPastAnswers[this.problemView.model.get("problem_id")] 
                = new PastAnswerList([],{userSet: this.userSet, problem: this.currentProblem});
            this.allPastAnswers[this.problemView.model.get("problem_id")].fetch({success: this.showLastAnswer});
        }
    },
    showLastAnswer: function(){
        var pastAnswerList =  this.allPastAnswers[this.currentProblem.get("problem_id")];
        if(_.isUndefined(this.problemView)){
            return;
        }
        if(this.problemView.model && !this.problemView.model.renderData){return;}

    	this.lastAnswerShown = true;
		var scores = pastAnswerList.last() ? pastAnswerList.last().get("scores"): ""
    	    , ansIDs = this.problemView.model.renderData.flags.ANSWER_ENTRY_ORDER
            , answerString = pastAnswerList.last() ? pastAnswerList.last().get("answer_string").split(/\t/): null
            , answer;
        if (answerString){
             answer = _(ansIDs).map(function(_id,i) { return {id: _id, score: scores[i], answer: answerString[i]};});
            this.denoteRightWrong(answer);
        }

    },
    postCheckAnswer: function(response){
    	this.$(".check-answer-button").button("reset");
        this.formatAnswer(response.answers);
    },
    postPreviewAnswer: function(response){
        _(response.answers).each(function(ans){
            if(ans.preview_latex_string){
                var popover = $("#"+ans.ans_name).popover("destroy")
                        .popover({title: "Preview",
                            content: "\\[" + ans.preview_latex_string + "\\]", html: true})
                        .popover("show")
                        .on("shown.bs.popover",function () {
                            MathJax.Hub.Queue(["Typeset",MathJax.Hub,$(this).attr("id")+"-popover"]);            
                        })
                popover.data("bs.popover").$tip.find(".popover-content").attr("id",ans.ans_name+ "-popover");
            }
        });
        
    },
    formatAnswer: function(_answers){
        var self = this;
        var answers = _(_.keys(_answers)).map(function(key) { return {id: key, score: _answers[key].score, 
                    answer: _answers[key].student_ans};});
        this.denoteRightWrong(answers);
        this.problemView.model.fetch({success: function(resp){
            self.userSet.trigger("change:problems",self.userSet);
        }});
    },
    postSubmitAnswer: function(response){
    	this.$(".submit-answer-button").button("reset");
        _(this.problemView.model.renderData.flags.ANSWER_ENTRY_ORDER).each(function(id){
            if(response.answers[id].ans_message){
                self.$(".set-message").append("<div class='alert alert-danger'>" + response.answers[id].ans_message
                        + "</div>");
            }
        })

        this.formatAnswer(response.answers);
    }
}); 

var PastAnswerListView = Backbone.View.extend({
    initialize: function(){
        _.bindAll(this,"render");
        this.collection.on("add",this.render);
    },
	render: function (){
		this.$el.html($("#past-answer-list-template").html());
		var table = this.$("table tbody");
		this.collection.each(function(_model){
			table.append(new PastAnswerView({model: _model}).render().el);
		})
		return this;
	}
});

var PastAnswerView = Backbone.View.extend({
	tagName: "tr",
	render: function (){
		//this.$el.html($("#past-answer-template").html());
		this.stickit();
		return this;
	},
	bindings: { ":el": {
		observe: ["answer_string","timestamp","scores"], 
		updateMethod: 'html',
		oGet: function(value){
			var answers = value[0].split(/\t/);
			answers.pop();
			var str = "";
			_(answers).each(function(ans,i){
				str += "<td style='color:"+(value[2].substring(i,i+1)==="1"?"green":"red")+"'>"+ans+"</td>";
			});
			return str + "<td>"+moment.unix(value[1]).format("MM/DD/YYYY [at] hh:mmA") +"</td>";
	}}}
});

/**  
  *  This produces the list of problems for a given user with a given set.  
  *  The collection is a UserProblemList
  *
  */
    
var UserProblemListView = Backbone.View.extend({
    tagName: "ul",
    className: "pagination",
    initialize: function(options){
        _(this).extend(_(options).pick("parent"));
    },
    render: function(){
        var self = this; 
        this.$el.empty();
        if(this.collection){
            this.collection.each(function(_prob){
                var id = _prob.get("problem_id"); 
                self.$el.append("<li class='problem-li' data-number='"+id+"'><a class='problem-button' href='#'>" +
                                id + "</a></li>");
            });
        }
        this.updatePaginator(); 
        return this;
    }, 
    set: function(opts){
        _(this).extend(_(opts).pick("collection"));  
        return this.render();
    },
    events: {"click .problem-button": "changeProblem"},
	changeProblem: function(obj){
        this.problemDecorated = false; 
        var _num = _.isObject(obj) ? $(obj.target).parent().data("number") : obj; 
        this.currentProblemNumber = _num; 
        this.updatePaginator();
        this.parent.changeProblem(_num);
    },
    updatePaginator: function () {
        var self = this;
        this.collection.each(function(_prob){
            var key = _prob.get("problem_id"); 
            if(key!=self.currentProblemNumber) {
                var status = 100-parseInt(100*parseFloat(_prob.get("status")));
                // change the background of the paginator button depending on the status of a problem. 
                self.$("li.problem-li[data-number='"+key+"'] a").css("background","-webkit-linear-gradient(top, white " +
                    status + "%, rgba(0,255,0,0.25) "+status+"%)").parent().removeClass("active"); 
            } else {
                self.$("li.problem-li[data-number='"+key+"'] a").removeAttr("style").parent().addClass("active"); 
            }
        })
    }    
});
    
return UserSetView; 
});
/*
This is a set of functions common to
*/

import moment from 'moment'
import common from '../common.js'

export const ProblemSetMixin = {
  data: function() {
    return {
      problem_set: common.new_problem_set
    }
  },
  computed: {
    displayOpenDate: {
      get(){ return common.formatDatetimeForBrowser(this.problem_set.open_date);},
      set(value){this.problem_set.open_date = common.parseDatetimeForBrowser(value);}
    }, // displayOpenDate
    displayReducedScoringDate: {
      get(){ return common.formatDatetimeForBrowser(this.problem_set.reduced_scoring_date);},
      set(value){this.problem_set.reduced_scoring_date = common.parseDatetimeForBrowser(value);}
    }, // displayReducedScoringDate
    displayDueDate: {
      get(){ return common.formatDatetimeForBrowser(this.problem_set.due_date);},
      set(value){this.problem_set.due_date = common.parseDatetimeForBrowser(value);}
    }, // displayDueDate
    displayAnswerDate: {
      get(){ return common.formatDatetimeForBrowser(this.problem_set.answer_date);},
      set(value){this.problem_set.answer_date = common.parseDatetimeForBrowser(value);}
    }, // displayAnswerDate
    validReducedScoring(){
      return moment.unix(this.problem_set.reduced_scoring_date)
          .isSameOrAfter(moment.unix(this.problem_set.open_date))},
    validDueDate(){
      return moment.unix(this.problem_set.due_date)
          .isSameOrAfter(moment.unix(this.problem_set.reduced_scoring_date))},
    validAnswerDate(){
      return moment.unix(this.problem_set.answer_date)
          .isSameOrAfter(moment.unix(this.problem_set.due_date))}
  }, // computed
  methods: {
    displaySet(_set_name){
      return _set_name.replace("_"," ")
    }
  }
}

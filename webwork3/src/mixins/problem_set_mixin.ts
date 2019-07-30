import moment from 'moment';
import Constants from '@/Constants';

import ProblemSet from '@/models/ProblemSet';

import Vue from 'vue';
import Component from 'vue-class-component';


// You can declare a mixin as the same style as components.
@Component
export default class ProblemSetMixin extends Vue {
  [x: string]: any;

  public displayOpenDate =  {
    get: () => {
      return Constants.formatDatetimeForBrowser(this.problem_set.get('open_date'));
    },
    set: (value: number) => {
      this.problem_set.set({open_date: Constants.parseDatetimeForBrowser(value)});
    },
  }; // displayOpenDate

  public displayReducedScoringDate =  {
    get: () => {
      return Constants.formatDatetimeForBrowser(this.problem_set.get('reduced_scoring_date'));
    },
    set: (value: number) => {
      this.problem_set.set({reduced_scoring_date: Constants.parseDatetimeForBrowser(value)});
    },
  }; // displayReducedScoringDate

  public displayDueDate =  {
    get: () => {
      return Constants.formatDatetimeForBrowser(this.problem_set.get('due_date'));
    },
    set: (value: number) => {
      this.problem_set.set({due_date: Constants.parseDatetimeForBrowser(value)});
    },
  }; // displayDueDate

  public displayAnswerDate =  {
    get: () => {
      return Constants.formatDatetimeForBrowser(this.problem_set.get('answer_date'));
    },
    set: (value: number) => {
      this.problem_set.set({answer_date: Constants.parseDatetimeForBrowser(value)});
    },
  }; // displayAnswerDate

  public validReducedScoring() {
    return moment.unix(this.problem_set.get('reduced_scoring_date'))
        .isSameOrAfter(moment.unix(this.problem_set.get('open_date')));
  }

  public validDueDate() {
    return moment.unix(this.problem_set.get('due_date'))
        .isSameOrAfter(moment.unix(this.problem_set.get('reduced_scoring_date')));
  }

  public validAnswerDate() {
    return moment.unix(this.problem_set.get('answer_date'))
        .isSameOrAfter(moment.unix(this.problem_set.get('due_date')));
  }

  public displaySet(setName: string): string {
    return setName.replace('_', ' ');
  }
}

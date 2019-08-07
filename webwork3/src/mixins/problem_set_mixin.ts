import moment from 'moment';
import Constants from '@/Constants';

// import ProblemSet from '@/models/ProblemSet';

import Vue from 'vue';
import Component from 'vue-class-component';


// You can declare a mixin as the same style as components.
@Component
export default class ProblemSetMixin extends Vue {
  [x: string]: any;

  get displayOpenDate(): string {
    return Constants.formatDatetimeForBrowser(this.set_params.open_date);
  }

  set displayOpenDate(value: string) {
    this.set_params.open_date = Constants.parseDatetimeForBrowser(value);
  }

  get displayReducedScoringDate(): string {
    return Constants.formatDatetimeForBrowser(this.set_params.reduced_scoring_date);
  }

  set displayReducedScoringDate(value: string) {
    this.set_params.reduced_scoring_date = Constants.parseDatetimeForBrowser(value);
  }

  get displayDueDate(): string {
    return Constants.formatDatetimeForBrowser(this.set_params.due_date);
  }

  set displayDueDate(value: string) {
    this.set_params.due_date = Constants.parseDatetimeForBrowser(value);
  }

  get displayAnswerDate(): string {
    return Constants.formatDatetimeForBrowser(this.set_params.answer_date);
  }

  set displayAnswerDate(value: string) {
    this.set_params.answer_date = Constants.parseDatetimeForBrowser(value);
  }


  public validReducedScoring() {
    return moment.unix(this.set_params.reduced_scoring_date)
        .isSameOrAfter(moment.unix(this.set_params.open_date));
  }

  public validDueDate() {
    return moment.unix(this.set_params.due_date)
        .isSameOrAfter(moment.unix(this.set_params.reduced_scoring_date));
  }

  public validAnswerDate() {
    return moment.unix(this.set_params.answer_date)
        .isSameOrAfter(moment.unix(this.set_params.due_date));
  }

  public displaySet(setName: string): string {
    return setName.replace('_', ' ');
  }

} // class ProblemSetMixin

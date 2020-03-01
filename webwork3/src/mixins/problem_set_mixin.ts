import moment from "moment";
import Vue from "vue";
import Component from "vue-class-component";

import { ProblemSet } from "@/store/models";
import Common from "@/common";

import problem_set_store from "@/store/modules/problem_sets";

// You can declare a mixin as the same style as components.
@Component
export default class ProblemSetMixin extends Vue {
  [x: string]: any;

  public setOpenDate(_set: ProblemSet, date_string: string) {
    // console.log("in setOpenDate"); // eslint-disable-line no-console
    // const od = problem_set_store.problem_sets.get(_set.set_id).open_date;
    // console.log(Common.formatDatetimeForBrowser(od)); // eslint-disable-line no-console
    _set.open_date = Common.parseDatetimeForBrowser(date_string);
  }

  public setReducedScoringDate(_set: ProblemSet, date_string: string) {
    _set.reduced_scoring_date = Common.parseDatetimeForBrowser(date_string);
  }

  public setDueDate(_set: ProblemSet, date_string: string) {
    _set.due_date = Common.parseDatetimeForBrowser(date_string);
  }

  public setAnswerDate(_set: ProblemSet, date_string: string) {
    _set.answer_date = Common.parseDatetimeForBrowser(date_string);
  }

  // get open_date(): string {
  //
  //     // tslint:disable-next-line
  //     console.log(this.problem_set.set_id);
  //   return this.formatDatetimeForBrowser(this.problem_set.open_date);
  // }
  //
  // set open_date(value: string) {
  //   this.problem_set.open_date = this.parseDatetimeForBrowser(value);
  // }
  //
  // get reduced_scoring_date(): string {
  //   // tslint:disable-next-line
  //   console.log(this.problem_set.set_id);
  //
  //   // tslint:disable-next-line
  //   console.log(this.problem_set);
  //
  //   return this.formatDatetimeForBrowser(this.problem_set.reduced_scoring_date);
  // }
  //
  // set reduced_scoring_date(value: string) {
  //   this.problem_set.reduced_scoring_date =  this.parseDatetimeForBrowser(value);
  // }
  //
  // get due_date(): string {
  //   return this.formatDatetimeForBrowser(this.problem_set.due_date);
  // }
  //
  // set due_date(value: string) {
  //   this.problem_set.due_date =  this.parseDatetimeForBrowser(value);
  // }
  //
  // get answer_date(): string {
  //   return this.formatDatetimeForBrowser(this.problem_set.answer_date);
  // }
  //
  // set answer_date(value: string) {
  //   this.problem_set.answer_date = this.parseDatetimeForBrowser(value);
  // }
  //
  // public validReducedScoring() {
  //   return moment.unix(this.problem_set.reduced_scoring_date)
  //       .isSameOrAfter(moment.unix(this.problem_set.open_date));
  // }
  //
  // public validDueDate() {
  //   return moment.unix(this.problem_set.due_date)
  //       .isSameOrAfter(moment.unix(this.problem_set.reduced_scoring_date));
  // }
  //
  // public validAnswerDate() {
  //   return moment.unix(this.problem_set.answer_date)
  //       .isSameOrAfter(moment.unix(this.problem_set.due_date));
  // }
  //
  // public formatDateForBrowser(dateInUnix: number) {
  //     return moment.unix(dateInUnix).format('YYYY-MM-DD');
  // }
  //
  // public formatDatetimeForBrowser(dateInUnix: number) {
  //     return moment.unix(dateInUnix).format('YYYY-MM-DD[T]HH:mm');
  // }
  //
  // public formatTimeForBrowser(dateInUnix: number) {
  //     return moment.unix(dateInUnix).format('HH:mm');
  // }
  //
  // public parseDatetimeForBrowser(dateString: string) {
  //   return moment(dateString, 'YYYY-MM-DD[T]HH:mm').unix();
  // }
} // class ProblemSetMixin

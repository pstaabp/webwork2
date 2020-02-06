import moment from "moment";
import Vue from "vue";
import Component from "vue-class-component";

import { ProblemSet } from "@/store/models";
import Common from "@/common";

// You can declare a mixin as the same style as components.
@Component
export default class ProblemSetMixin extends Vue {
  [x: string]: any;

  public emptySet(): ProblemSet {
    return {
      set_id: "XXX",
      assigned_users: [],
      problems: [],
      set_header: "",
      hardcopy_header: "",
      open_date: 0,
      due_date: 0,
      answer_date: 0,
      reduced_scoring_date: 0,
      visible: false,
      enable_reduced_scoring: false,
      assignment_type: "set",
      description: "",
      restricted_release: "",
      restricted_status: 0,
      attempts_per_version: -1,
      time_interval: 0,
      versions_per_interval: 1,
      version_time_limit: 0,
      version_creation_time: 0,
      problem_randorder: false,
      version_last_attempt_time: 0,
      problems_per_page: 1,
      hide_score: "",
      hide_score_by_problem: "",
      hide_work: "",
      time_limit_cap: 180,
      restrict_ip: "",
      relax_restrict_ip: "",
      restricted_login_proctor: "",
      hide_hint: true,
      restrict_prob_progression: false,
      email_instructor: false
    };
  }

  public setOpenDate(_set: ProblemSet, date_string: string) {
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

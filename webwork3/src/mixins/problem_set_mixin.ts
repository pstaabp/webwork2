import moment from 'moment';
import Constants from '@/Constants';

// import ProblemSet from '@/models/ProblemSet';

import Vue from 'vue';
import Component from 'vue-class-component';


// You can declare a mixin as the same style as components.
@Component
export default class ProblemSetMixin extends Vue {
  [x: string]: any;

  get set_id() {
    return this.problem_set.get('set_id');
  }

  get visible() {
    return this.problem_set.get('visible');
  }

  set visible(value: boolean) {
    this.problem_set.set({visible: value});
  }

  get open_date(): string {
    return Constants.formatDatetimeForBrowser(this.problem_set.get('open_date'));
  }

  set open_date(value: string) {
    this.problem_set.set({open_date: Constants.parseDatetimeForBrowser(value)});
  }

  get reduced_scoring_date(): string {
    return Constants.formatDatetimeForBrowser(this.problem_set.get('reduced_scoring_date'));
  }

  set reduced_scoring_date(value: string) {
    this.problem_set.set({reduced_scoring_date: Constants.parseDatetimeForBrowser(value)});
  }

  get due_date(): string {
    return Constants.formatDatetimeForBrowser(this.problem_set.get('due_date'));
  }

  set due_date(value: string) {
    this.problem_set.set({due_date: Constants.parseDatetimeForBrowser(value)});
  }

  get answer_date(): string {
    return Constants.formatDatetimeForBrowser(this.problem_set.get('answer_date'));
  }

  set answer_date(value: string) {
    this.problem_set.set({answer_date: Constants.parseDatetimeForBrowser(value)});
  }

  get enable_reduced_scoring(): boolean {
    return this.problem_set.get('enable_reduced_scoring');
  }

  set enable_reduced_scoring(value: boolean) {
    this.problem_set.set({enable_reduced_scoring: value});
  }

  get hide_hint(): boolean {
    return this.problem_set.get('hide_hint');
  }

  set hide_hint(value: boolean) {
    this.problem_set.set({hide_hint: value});
  }

  get assignment_type(): string {
    return this.problem_set.get('assignment_type');
  }

  set assignment_type(value: string) {
    this.problem_set.set({assignment_type: value});
  }

  get version_time_limit(): number {
    return this.problem_set.get('version_time_limit');
  }

  set version_time_limit(value: number) {
    this.problem_set.set({version_time_limit: value});
  }


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

} // class ProblemSetMixin

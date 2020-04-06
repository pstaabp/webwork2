import Vue from "vue";
import Component from "vue-class-component";

import { ProblemSet } from "@/store/models";
import { parseDatetimeForBrowser } from "@/common";

// You can declare a mixin as the same style as components.
@Component
export default class ProblemSetMixin extends Vue {
  public setOpenDate(_set: ProblemSet, date_string: string) {
    _set.open_date = parseDatetimeForBrowser(date_string);
  }

  public setReducedScoringDate(_set: ProblemSet, date_string: string) {
    _set.reduced_scoring_date = parseDatetimeForBrowser(date_string);
  }

  public setDueDate(_set: ProblemSet, date_string: string) {
    _set.due_date = parseDatetimeForBrowser(date_string);
  }

  public setAnswerDate(_set: ProblemSet, date_string: string) {
    _set.answer_date = parseDatetimeForBrowser(date_string);
  }
} // class ProblemSetMixin

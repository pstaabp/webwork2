// This file has common variables and objects needed throughout the ww3 interface

import * as moment from "moment";

import { ProblemSet, User, Problem } from "@/store/models";

import { isString, isNumber, isInteger } from "lodash-es";

export interface ViewInfo {
  name: string;
  icon: string;
  route: string;
  show_set: boolean;
  show_user: boolean;
}

export interface SidebarInfo {
  name: string;
  comp: string;
}

export interface ProblemViewOptions {
  numbered: boolean;
  reorder: boolean;
  add: boolean;
  value: boolean;
  attempts: boolean;
  edit: boolean;
  randomize: boolean;
  delete: boolean;
  mark_all: boolean;
  tags: boolean;
  path: boolean;
  target_set: boolean;
}

export const LIB_PROB: ProblemViewOptions = {
  // define characteristics of a library problem.
  numbered: false,
  reorder: false,
  add: true,
  value: false,
  attempts: false,
  edit: true,
  randomize: true,
  delete: false,
  mark_all: false,
  tags: true,
  path: true,
  target_set: true,
};

export const SET_PROB: ProblemViewOptions = {
  // define characteristics of a library problem.
  numbered: true,
  reorder: true,
  add: false,
  value: true,
  attempts: true,
  edit: true,
  randomize: true,
  delete: true,
  mark_all: true,
  tags: false,
  path: false,
  target_set: false,
};

export function newUser(): User {
  return {
    user_id: "__new_user",
    first_name: "",
    last_name: "",
    status: "",
    comment: "",
    useMathView: false,
    permission: -5,
    recitation: "",
    student_id: "",
    lis_source_did: "",
    email_address: "",
    displayMode: "MathJax",
    section: "",
    showOldAnswers: false,
    useWirisEditor: false,
  };
}

export function emptySetting() {
  return {
    var: "",
    type: "",
    doc: "",
    category: "",
    value: 0,
    doc2: "",
    hashVar: {},
    values: [],
    labels: [],
    min: 0,
    width: 0
  };
}

export function newProblemSet(): ProblemSet {
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
    email_instructor: false,
  };
}

/**
 *  The following was taken from: https://gist.github.com/Yimiprod/7ee176597fef230d1451
 *
 * Deep diff between two object, using lodash
 * @param  {Object} object Object compared
 * @param  {Object} base   Object to compare with
 * @return {Object}        Return a new object who represent the diff

export function difference(
  object: { [key: string]: number | string | object },
  base: { [key: string]: number | string | object }
) {
  function changes(
    object: { [key: string]: number | string | object },
    base: { [key: string]: number | string | object }
  ) {
    return transform(object, function (
      result: { [key: string]: number | string | object },
      value: { [key: string]: number | string | object },
      key: string
    ) {
      if (!isEqual(value, base[key])) {
        result[key] =
          isObject(value) && isObject(base[key])
            ? changes(value, base[key])
            : value;
      }
    });
  }
  return changes(object, base);
}
*/

// this function takes in a problem set and parses out the numbers:

function parseInteger(prop: number | string, default_value = 0) {
  if (!prop) {
    return default_value;
  }
  if (isNumber(prop) && !isInteger(prop)) {
    throw prop + " is not an integer";
  }
  if (isString(prop)) {
    return parseInt(prop + "", 10);
  }
  return prop;
}

// This is used to parse a problem set.  Some of the integers coming from ther
// server are strings and should be integers.

export function parseProblemSet(_set: ProblemSet) {
  const problem_set = newProblemSet();
  Object.assign(problem_set, _set);
  problem_set.open_date = parseInteger(_set.open_date);
  problem_set.reduced_scoring_date = parseInteger(_set.reduced_scoring_date);
  problem_set.due_date = parseInteger(_set.due_date);
  problem_set.answer_date = parseInteger(_set.answer_date);
  problem_set.attempts_per_version = parseInteger(_set.attempts_per_version);
  problem_set.time_interval = parseInteger(_set.time_interval);
  problem_set.versions_per_interval = parseInteger(_set.versions_per_interval);
  problem_set.version_time_limit = parseInteger(_set.version_time_limit);
  problem_set.version_creation_time = parseInteger(_set.version_creation_time);
  problem_set.version_last_attempt_time = parseInteger(
    _set.version_last_attempt_time
  );
  problem_set.problems_per_page = parseInteger(_set.problems_per_page);
  //  console.log(difference(_set, problem_set)); // eslint-disable-line no-console
  return problem_set;
}

export function validReducedScoring(_set: ProblemSet) {
  return moment
    .unix(_set.reduced_scoring_date)
    .isSameOrAfter(moment.unix(_set.open_date));
}

export function validDueDate(_set: ProblemSet) {
  return moment
    .unix(_set.due_date)
    .isSameOrAfter(moment.unix(_set.reduced_scoring_date));
}

export function validAnswerDate(_set: ProblemSet) {
  return moment
    .unix(_set.answer_date)
    .isSameOrAfter(moment.unix(_set.due_date));
}

export function ww3Views(): ViewInfo[] {
  return [
    {
      name: "Calendar",
      icon: "calendar",
      route: "calendar",
      show_set: false,
      show_user: false,
    },
    {
      name: "Classlist Manager",
      icon: "people",
      route: "classlist",
      show_set: false,
      show_user: false,
    },
    {
      name: "Problem Set Details",
      icon: "info-square",
      route: "set-view",
      show_set: true,
      show_user: false,
    },
    {
      name: "Library Browser",
      icon: "book",
      route: "library",
      show_set: true,
      show_user: false,
    },
    {
      name: "Problem Sets Manager",
      icon: "list-ul",
      route: "problem-sets",
      show_set: false,
      show_user: true,
    },
    {
      name: "Problem Editor",
      icon: "pencil",
      route: "editor",
      show_set: false,
      show_user: false,
    },
    {
      name: "Statistics",
      icon: "bar-chart",
      route: "statistics",
      show_set: false,
      show_user: false,
    },
    {
      name: "Import/Export Sets",
      icon: "arrow-left-right",
      route: "import-export",
      show_set: false,
      show_user: false,
    },
    {
      name: "Settings",
      icon: "gear",
      route: "settings",
      show_set: false,
      show_user: false,
    },
  ];
}

export function formatDateTime(value: number) {
  return moment.unix(value).format("YYYY-MM-DD[T]HH:mm");
}

export function parseDatetimeForBrowser(date_string: string) {
  return moment.default(date_string, "YYYY-MM-DD[T]HH:mm").unix();
}

export function setOpenDate(_set: ProblemSet, date_string: string) {
  _set.open_date = parseDatetimeForBrowser(date_string);
}

export function setReducedScoringDate(_set: ProblemSet, date_string: string) {
  _set.reduced_scoring_date = parseDatetimeForBrowser(date_string);
}

export function setDueDate(_set: ProblemSet, date_string: string) {
  _set.due_date = parseDatetimeForBrowser(date_string);
}

export function setAnswerDate(_set: ProblemSet, date_string: string) {
  _set.answer_date = parseDatetimeForBrowser(date_string);
}

export function round2(value: number | string) {
  if (typeof value === "string") {
    return value;
  }
  return Math.round(100 * value) / 100;
}

export interface StringMap {
  [key: string]: string | number;
}

export function  permissionLevels(): { [key: string]: string } {
  return {
    "20": "admin",
    "10": "professor",
    "8": "ta",
    "7": "grade_proctor",
    "6": "login_proctor",
    "0": "student",
    "-5": "guest",
  };
}

export default class Common {
  public static sidebars(): SidebarInfo[] {
    return [
      { name: "Problem Sets", comp: "problem_sets" },
      { name: "Library Options", comp: "lib_opts" },
      { name: "Messages", comp: "messages" },
    ];
  }

  public static userTypes(): { [key: string]: string } {
    return {
      C: "enrolled",
      P: "proctor",
      A: "audit",
      D: "drop",
    };
  }


  public static dateTypes(): string[] {
    return ["due_date", "reduced_scoring_date", "due_date", "answer_date"];
  }
  //
  // public static formatDateTime(date_in_unix: number) {
  //   return moment.unix(date_in_unix).format("MM/DD/YYYY [at] hh:mma");
  // }
  // public static formatDateForBrowser(date_in_unix: number) {
  //   return moment.unix(date_in_unix).format("YYYY-MM-DD");
  // }
  //
  // public static formatDatetimeForBrowser(date_in_unix: number) {
  //   return moment.unix(date_in_unix).format("YYYY-MM-DD[T]hh:mma");
  // }
  //
  // public static formatTimeForBrowser(date_in_unix: number) {
  //   return moment.unix(date_in_unix).format("HH:mm");
  // }

  public static newProblem(): Problem {
    return {
      att_to_open_children: "",
      counts_parent_grade: [],
      flags: "",
      max_attempts: -1,
      prCount: "",
      prPeriod: "",
      problem_id: 0,
      set_id: "",
      showMeAnother: "",
      showMeAnotherCount: 0,
      source_file: "",
      value: 1,
      problem_source: "",
    };
  }
} // class Constants

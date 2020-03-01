// This file has common variables and objects needed throughout the ww3 interface

import moment from "moment";

import { ProblemSet, User, Problem } from "@/store/models";

import { transform, isEqual, isObject, isString, isNumber, isInteger} from "lodash-es";

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
  target_set: true
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
  target_set: false
};

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
    email_instructor: false
  };
}

/**
 *  The following was taken from: https://gist.github.com/Yimiprod/7ee176597fef230d1451
 *
 * Deep diff between two object, using lodash
 * @param  {Object} object Object compared
 * @param  {Object} base   Object to compare with
 * @return {Object}        Return a new object who represent the diff
 */
export function difference(
  object: { [key: string]: any },
  base: { [key: string]: any }
) {
  function changes(
    object: { [key: string]: any },
    base: { [key: string]: any }
  ) {
    return transform(object, function(
      result: { [key: string]: any },
      value: { [key: string]: any },
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

// this function takes in a problem set and parses out the numbers:

function parseInteger(prop: number | string){
  if (isNumber(prop) && ! isInteger(prop)) {
    throw prop + " is not an integer";
  }
  if (isString(prop)){
    return parseInt(prop + "",10);
  }
  return prop;
}

// This is used to parse a problem set.  Some of the integers coming from ther
// server are strings and should be integers.

export function parseProblemSet(_set: ProblemSet) {
  const _problem_set = newProblemSet();
  Object.assign(_problem_set,_set);
  _problem_set.open_date = parseInteger(_set.open_date);
  _problem_set.reduced_scoring_date = parseInteger(_set.reduced_scoring_date);
  _problem_set.due_date = parseInteger(_set.due_date);
  _problem_set.answer_date = parseInteger(_set.answer_date);
  _problem_set.attempts_per_version = parseInteger(_set.attempts_per_version);
  _problem_set.time_interval = parseInteger(_set.time_interval);
  _problem_set.versions_per_interval = parseInteger(_set.versions_per_interval);
  _problem_set.version_time_limit = parseInteger(_set.version_time_limit);
  _problem_set.version_creation_time = parseInteger(_set.version_creation_time);
  _problem_set.version_last_attempt_time = parseInteger(_set.version_last_attempt_time);
  _problem_set.problems_per_page = parseInteger(_set.problems_per_page);
  console.log(difference(_set,_problem_set)); // eslint-disable-line no-console
  return _problem_set;
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

export default class Common {
  public static views(): ViewInfo[] {
    return [
      {
        name: "Calendar",
        icon: "calendar",
        route: "calendar",
        show_set: false,
        show_user: false
      },
      {
        name: "Classlist Manager",
        icon: "people",
        route: "classlist",
        show_set: false,
        show_user: false
      },
      {
        name: "Problem Set Details",
        icon: "info-square",
        route: "set-view",
        show_set: true,
        show_user: false
      },
      {
        name: "Library Browser",
        icon: "book",
        route: "library",
        show_set: true,
        show_user: false
      },
      {
        name: "Problem Sets Manager",
        icon: "list-ul",
        route: "problem-sets",
        show_set: false,
        show_user: true
      },
      {
        name: "Problem Editor",
        icon: "pencil",
        route: "editor",
        show_set: false,
        show_user: false
      },
      {
        name: "Statistics",
        icon: "bar-chart",
        route: "statistics",
        show_set: false,
        show_user: false
      },
      {
        name: "Import/Export Sets",
        icon: "arrow-left-right",
        route: "import-export",
        show_set: false,
        show_user: false
      },
      {
        name: "Settings",
        icon: "gear",
        route: "settings",
        show_set: false,
        show_user: false
      }
    ];
  }

  public static sidebars(): SidebarInfo[] {
    return [
      { name: "Problem Sets", comp: "problem_sets" },
      { name: "Library Options", comp: "lib_opts" },
      { name: "Messages", comp: "messages" }
    ];
  }

  public static userTypes(): { [key: string]: string } {
    return {
      C: "enrolled",
      P: "proctor",
      A: "audit",
      D: "drop"
    };
  }

  public static permissionLevels(): { [key: string]: string } {
    return {
      "20": "admin",
      "10": "professor",
      "8": "ta",
      "7": "grade_proctor",
      "6": "login_proctor",
      "0": "student",
      "-5": "guest"
    };
  }

  public static dateTypes(): string[] {
    return ["due_date", "reduced_scoring_date", "due_date", "answer_date"];
  }

  public static formatDateTime(date_in_unix: number) {
    return moment.unix(date_in_unix).format("MM/DD/YYYY [at] hh:mma");
  }
  public static formatDateForBrowser(dateInUnix: number) {
    return moment.unix(dateInUnix).format("YYYY-MM-DD");
  }

  public static formatDatetimeForBrowser(dateInUnix: number) {
    return moment.unix(dateInUnix).format("YYYY-MM-DD[T]hh:mma");
  }

  public static formatTimeForBrowser(dateInUnix: number) {
    return moment.unix(dateInUnix).format("HH:mm");
  }

  public static parseDatetimeForBrowser(dateString: string) {
    return moment(dateString, "YYYY-MM-DD[T]HH:mm").unix();
  }

  public static newUser(): User {
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
      useWirisEditor: false
    };
  }

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
      problem_source: ""
    };
  }
} // class Constants

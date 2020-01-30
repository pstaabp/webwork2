// This file has common variables and objects needed throughout the ww3 interface

import moment from 'moment';

import {ProblemSet, User, Problem} from '@/store/models';

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

export const LIB_PROB: ProblemViewOptions = { // define characteristics of a library problem.
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

export const SET_PROB: ProblemViewOptions = { // define characteristics of a library problem.
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

export default class Common {
  public static views(): ViewInfo[] {
    return [
      {name: 'Calendar', icon: 'calendar', route: 'calendar', show_set: false, show_user: false},
      {name: 'Classlist Manager', icon: 'people', route: 'classlist', show_set: false, show_user: false},
      {name: 'Problem Set Details', icon: 'info-square', route: 'set-view', show_set: true, show_user: false},
      {name: 'Library Browser', icon: 'book', route: 'library', show_set: true, show_user: false},
      {name: 'Problem Sets Manager', icon: 'list-ul', route: 'problem-sets', show_set: false, show_user: true},
      {name: 'Problem Editor', icon: 'pencil', route: 'editor', show_set: false, show_user: false},
      {name: 'Statistics', icon: 'bar-chart', route: 'statistics', show_set: true, show_user: true},
      {name: 'Import/Export Sets', icon: 'arrow-left-right', route: 'import-export', show_set: false, show_user: false},
      {name: 'Settings', icon: 'gear', route: 'settings', show_set: false, show_user: false},
    ];
  }

  public static sidebars(): SidebarInfo[] {
    return [
      {name: 'Problem Sets', comp: 'problem_sets'},
      {name: 'Library Options', comp: 'lib_opts'},
      {name: 'Messages', comp: 'messages'},
    ];
  }

  public static userTypes(): {[key: string]: string} {
    return {
      C: 'enrolled',
      P: 'proctor',
      A: 'audit',
      D: 'drop',
    };
  }

  public static permissionLevels(): {[key: string]: string} {
    return {
      '20': 'admin',
      '10': 'professor',
      '8': 'ta',
      '7': 'grade_proctor',
      '6': 'login_proctor',
      '0': 'student',
      '-5': 'guest',
    };
  }

  public static dateTypes(): string[] {
    return ['due_date', 'reduced_scoring_date', 'due_date', 'answer_date'];
  }


  public static formatDateForBrowser(dateInUnix: number) {
      return moment.unix(dateInUnix).format('YYYY-MM-DD');
  }

  public static formatDatetimeForBrowser(dateInUnix: number) {
      return moment.unix(dateInUnix).format('YYYY-MM-DD[T]HH:mm');
  }

  public static formatTimeForBrowser(dateInUnix: number) {
      return moment.unix(dateInUnix).format('HH:mm');
  }

  public static parseDatetimeForBrowser(dateString: string) {
    return moment(dateString, 'YYYY-MM-DD[T]HH:mm').unix();
  }

  public static validReducedScoring(_set: ProblemSet) {
    return moment.unix(_set.reduced_scoring_date).isSameOrAfter(moment.unix(_set.open_date));
  }

  public static validDueDate(_set: ProblemSet) {
    return moment.unix(_set.due_date).isSameOrAfter(moment.unix(_set.reduced_scoring_date));
  }

  public static validAnswerDate(_set: ProblemSet) {
    return moment.unix(_set.answer_date).isSameOrAfter(moment.unix(_set.due_date));
  }

  public static newUser(): User {
      return {
        user_id: '__new_user',
        first_name: '',
        last_name: '',
        status: '',
        comment: '',
        useMathView: false,
        permission: -5,
        recitation: '',
        student_id: '',
        lis_source_did: '',
        email_address: '',
        displayMode: 'MathJax',
        section: '',
        showOldAnswers: false,
        useWirisEditor: false,
      };
  }

  public static newProblem(): Problem {
    return {
      att_to_open_children: '',
      counts_parent_grade: [],
      flags: '',
      max_attempts: -1,
      prCount: '',
      prPeriod: '',
      problem_id: 0,
      set_id: '',
      showMeAnother: '',
      showMeAnotherCount: 0,
      source_file: '',
      value: 1,
      problem_source: '',
    };
  }

} // class Constants

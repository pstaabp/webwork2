// This file has common variables and objects needed throughout the ww3 interface

import moment from 'moment';

export default class Constants {
  public static views(): Array<{name: string, icon: string, route: string}> {
    return [
      {name: 'Calendar', icon: 'calendar', route: 'calendar'},
      {name: 'Classlist Manager', icon: 'users', route: 'classlist'},
      {name: 'Problem Set Details', icon: 'info-circle', route: 'set-details'},
      {name: 'Library Browser', icon: 'university', route: 'library'},
      {name: 'Problem Sets Manager', icon: 'list-alt', route: 'problem-sets'},
      {name: 'Problem Editor', icon: 'edit', route: 'editor'},
      {name: 'Statistics', icon: 'chart-bar', route: 'statistics'},
      {name: 'Import/Export Sets', icon: 'exchange-alt', route: 'import-export'},
      {name: 'Settings', icon: 'cogs', route: 'settings'},
    ];
  }

  public static sidebars(): Array<{name: string, comp: string}> {
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

  public static parseDatetimeForBrowser(dateString: number) {
    return moment(dateString, 'YYYY-MM-DD[T]HH:mm').unix();
  }
} // class Constants

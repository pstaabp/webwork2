// This file has common variables and objects needed throughout the ww3 interface

import moment from 'moment'

export default {
    new_user: {
      first_name: "",
      last_name: "",
      user_id: "",
      email_address: "",
      student_id: "",
      status: "",
      recitation: "",
      section: "",
      comment: "",
      permission: 0
    },
    new_problem_set: {
      set_id: "",
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
      versions_per_interval: 0,
      version_time_limit: 0,
      version_creation_time: 0,
      problem_randorder: false,
      version_last_attempt_time: 0,
      problems_per_page: 1,
      hide_score: "Y",
      hide_score_by_problem: "Y",
      hide_work : "Y",
      time_limit_cap: 0,
      restrict_ip: "No",
      relax_restrict_ip: "No",
      restricted_login_proctor: "No",
      hide_hint: false,
      restrict_prob_progression: false,
      email_instructor: false,
    },
    new_problem: {
      att_to_open_children: "",
      counts_parent_grade: "",
      flags: "",
      max_attempts: -1,
      prCount: "",
      prPeriod: "",
      problem_id: 1,
      set_id: "",
      showMeAnother: "",
      showMeAnotherCount: 0,
      source_file: "",
      value: 1
    },
    user_types: {
      'C': "enrolled",
      'P': "proctor",
      'A': "audit",
      'D': "drop"
    },
    permission_levels: {
      20: "admin",
      10: "professor",
      0: "student",
      "-5": "guest"
    },
    date_props: ["due_date","reduced_scoring_date","due_date","answer_date"],
    formatDateForBrowser(date_in_unix){
        return moment.unix(date_in_unix).format("YYYY-MM-DD")
    },
    formatDatetimeForBrowser(date_in_unix){
        return moment.unix(date_in_unix).format("YYYY-MM-DD[T]HH:mm")
    },
    formatTimeForBrowser(date_in_unix){
        return moment.unix(date_in_unix).format("HH:mm")
    },
    parseDatetimeForBrowser(date_string){
      return moment(date_string,"YYYY-MM-DD[T]HH:mm").unix()
    }
}

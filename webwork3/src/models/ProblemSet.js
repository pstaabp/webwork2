import {Model} from 'vue-mc'

export default class ProblemSet extends Model {
  defaults() {
    return {
      set_id: null,
      set_header: "",
      hardcopy_header: "",
      open_date: "",
      due_date: "",
      answer_date: "",
      reduced_scoring_date: "",
      visible: false,
      enable_reduced_scoring: false,
      assignment_type: "default",
      attempts_per_version: -1,
      time_interval: 0,
      versions_per_interval: 0,
      version_time_limit: 0,
      version_creation_time: 0,
      problem_randorder: false,
      version_last_attempt_time: 0,
      problems_per_page: 0,
      restricted_release: "",
      restricted_status: 1.0,
      hide_score: "N",
      hide_score_by_problem: "N",
      hide_work: "N",
      hide_hint: false,
      time_limit_cap: false,
      restrict_ip: "No",
      relax_restrict_ip: "No",
      restricted_login_proctor: "No",
      assigned_users: null,
      problems: null,
      description: "",
      pg_password: "",
      restrict_prob_progression: 0,
      email_instructor: 0,
    }
  }

  mutations () {
    return {

    }
  }

  options() {
        return {
            identifier: 'set_id',
        }
    }

  routes() {
    return {
      save: '/webwork3/api/courses/test/sets/{set_id}',
    }
  }
}

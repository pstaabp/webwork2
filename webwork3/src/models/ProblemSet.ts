import Model from './Model';
import UserList from './UserList';
import ProblemList from './ProblemList';

export default class ProblemSet extends Model {

  protected _idAttribute = 'set_id';

  constructor(attrs?: object, opts?: {parse: boolean}) {
    super(attrs, opts);
  }

  public defaults() {
    return {
      set_id: '',
      assigned_users: UserList,
      problems: ProblemList,
      set_header: '',
      hardcopy_header: '',
      open_date: 0,
      due_date: 0,
      answer_date: 0,
      reduced_scoring_date: 0,
      visible: false,
      enable_reduced_scoring: false,
      assignment_type: 'set',
      description: '',
      restricted_release: '',
      restricted_status: 0,
      attempts_per_version: -1,
      time_interval: 0,
      versions_per_interval: 0,
      version_time_limit: 0,
      version_creation_time: 0,
      problem_randorder: false,
      version_last_attempt_time: 0,
      problems_per_page: 1,
      hide_score: 'Y',
      hide_score_by_problem: 'Y',
      hide_work : 'Y',
      time_limit_cap: 0,
      restrict_ip: 'No',
      relax_restrict_ip: 'No',
      restricted_login_proctor: 'No',
      hide_hint: false,
      restrict_prob_progression: false,
      email_instructor: false,
    };
  }

  public dataTypes(): {[key: string]: string | RegExp} {
    return {
      set_id: /^[a-zA-Z_](\w)*/,
      open_date: 'nonnegint',
      reduced_scoring_date:  'nonnegint',
      due_date: 'nonnegint',
      answer_date:  'nonnegint',
      assigned_users: 'UserList',
    };
  }

  public required_fields() {
    return ['set_id'];
  }

} // class Problem Set

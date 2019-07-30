import Model from './Model';

export default class Problem extends Model {

  protected _idAttribute = 'problem_id';

  constructor(opts?: object) {
    super(opts);
  }

  public defaults() {
    return {
      att_to_open_children: '',
      counts_parent_grade: '',
      flags: '',
      max_attempts: -1,
      prCount: '',
      prPeriod: '',
      problem_id: 1,
      set_id: '',
      showMeAnother: '',
      showMeAnotherCount: 0,
      source_file: '',
      value: 1,
    };
  }

  public dataTypes() {
    return {
      att_to_open_children: 'string',
      counts_parent_grade: 'string',
      flags: 'string',
      max_attempts: 'integer',
      prCount: 'string',
      prPeriod: 'string',
      problem_id: 'nonnegint',
      set_id: 'string',
      showMeAnother: 'string',
      showMeAnotherCount: 'nonnegint',
      source_file: 'string',
      value: 'integer',
    };
  }

  public required_fields() {
    return ['problem_id'];
  }


} // class User

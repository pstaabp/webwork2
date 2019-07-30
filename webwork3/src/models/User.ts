import Model from './Model';

export default class User extends Model {
  protected _idAttribute = 'user_id';

  constructor(opts?: object) {
    super(opts);
  }

  public defaults() {
    return {
      user_id: '',
      first_name: '',
      last_name: '',
      status: '',
      comment: '',
      useMathView: false,
      permission: 0,
      recitation: '',
      student_id: '',
      lis_source_did: '',
      email_address: '',
      displayMode: 'MathJax',
      section: '',
      showOldAnswers: true,
      useWirisEditor: false,
    };
  }

  public dataTypes() {
    return {
      user_id: /^[a-zA-Z_]\w*/,
      first_name: 'string',
      last_name: 'string',
      status: 'string',
      comment: 'string',
      useMathView: 'boolean',
      permission: 'integer',
      recitation: 'string',
      student_id: 'string',
      lis_source_did: 'string',
      email_address: 'string',
      displayMode: 'string',
      section: 'string',
      showOldAnswers: 'boolean',
      useWirisEditor: 'boolean',
    };
  }

  public required_fields() {
    return ['user_id'];
  }


} // class User

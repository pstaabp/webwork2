import Model from './Model';

export default class Setting extends Model {
  protected _idAttribute = 'var';
  constructor(opts?: object) {
    super(opts);
  }

  public defaults() {
    return {
      var: 'varname',
      type: '',
      doc: '',
      category: '',
      value: '',
      doc2: '',
      hashVar: {},
      values: [],
      labels: [],
      min: 0,
      width: 10,
    };
  }

  public dataTypes() {
    return {
      var: 'string',
      type: 'string',
      doc: 'string',
      category: 'string',
      value: 'string',
      doc2: 'string',
      hashVar: 'object',
      values: 'array',
      labels: 'array',
      min: 'number',
      width: 'number',
    };
  }

  public required_fields() {
    return ['var', 'type', 'doc', 'category'];
  }


} // class User

import Model from './Model';

export default class Setting extends Model {
  protected _idAttribute = 'var';
  constructor(opts?: object) {
    super(opts);
  }

  public defaults() {
    return {
      var: 'varname',
    };
  }

  public dataTypes() {
    return {
      var: 'string',
    };
  }

  public required_fields() {
    return ['var'];
  }


} // class User

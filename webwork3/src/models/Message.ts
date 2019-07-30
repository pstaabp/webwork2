import Model from './Model';
import Collection from './Collection';

export default class Message extends Model {

  protected _idAttribute = 'message_id';

  constructor(opts?: object) {
    super(opts);
  }

  public defaults() {
    return {
      message: '',
      message_id: 0,
    };
  }

  public dataTypes() {
    return {
      message: 'string',
      message_id: 'nonnegint',
    };
  }

  public required_fields() {
    return ['message', 'message_id'];
  }


} // class User

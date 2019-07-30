import User from '@/models/User';


export default class LoginInfo {
  public logged_in_user: User = new User({user_id: 'XXXX'});
  public course_id: string = '';

  constructor(course_id?: string, _user?: User) {
    this.logged_in_user = _user ? _user : new User({user_id: 'XXXX'});
    this.course_id = course_id ? course_id : '';
  }


}

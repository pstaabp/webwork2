import User from './User';
import Collection from './Collection';

export default class UserList extends Collection<User> {

  public constructor(sets?: User[]) {
    super(sets);
  }
} // class ProblemSetList

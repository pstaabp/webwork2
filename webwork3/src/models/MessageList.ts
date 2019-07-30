import Collection from './Collection';
import Message from './Message';

export default class MessageList extends Collection<Message> {

  public constructor(sets?: Message[]) {
    super(sets);
  }
} // class ProblemSetList

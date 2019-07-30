import ProblemSet from './ProblemSet';
import Collection from './Collection';

export default class ProblemSetList extends Collection<ProblemSet> {

  public constructor(sets?: ProblemSet[]) {
    super(sets);
  }
} // class ProblemSetList

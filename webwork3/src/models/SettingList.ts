import Setting from './Setting';
import Collection from './Collection';

export default class SettingList extends Collection<Setting> {

  public constructor(settings?: Setting[]) {
    super(settings);
  }
} // class ProblemSetList

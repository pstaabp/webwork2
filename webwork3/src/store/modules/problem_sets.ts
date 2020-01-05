import {VuexModule, Module, Action, Mutation, getModule} from 'vuex-module-decorators';
import {ProblemSet} from '@/store/models';
import store from '@/store';

//import {LoginModule} from './login';
import login_module from './login';
//const loginModule = getModule(LoginModule);


const name = 'problem_set_store';

// this is to prevent an error occur with a hot reloading.

if (store.state[name]) {
  store.unregisterModule(name);
}

const api_url = '/webwork3/api';

import axios from 'axios';


@Module({
  namespaced: true,
  name: 'problem_set_store',
  store,
  dynamic: true,
})
export class ProblemSetsModule extends VuexModule {
  private problem_sets: Map<string, ProblemSet> = new Map();

  @Mutation
  public setProblemSets(_sets: ProblemSet[]) {
    _sets.forEach( (_set) => {this.problem_sets.set(_set.set_id, _set); });
  }

  // Settings actions
  @Action
  public async fetchProblemSets() {
    const response = await axios.get(api_url + '/courses/' + login_module.login_info.course_id + '/sets');
    const _sets  = response.data as ProblemSet[];
    this.setProblemSets(_sets);
  } // fetchProblemSets

}

export default getModule(ProblemSetsModule);

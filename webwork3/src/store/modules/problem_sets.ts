import {VuexModule, Module, Action, Mutation, getModule} from 'vuex-module-decorators';
import {ProblemSet} from '@/store/models';
import store from '@/store';

import login_module from './login';

// this is to prevent an error occur with a hot reloading.

if (store.state.problem_set_store) {
  store.unregisterModule('problem_set_store');
}

import axios from 'axios';


@Module({
  namespaced: true,
  name: 'problem_set_store',
  store,
  dynamic: true,
})
export class ProblemSetsModule extends VuexModule {
  private _problem_sets: Map<string, ProblemSet> = new Map();

  public get problem_sets() {
    return this._problem_sets;
  }

  public get set_names() {
    return Array.from(this._problem_sets.keys());
  }

  @Mutation
  public setProblemSets(_sets: ProblemSet[]) {
    _sets.forEach( (_set) => {this._problem_sets.set(_set.set_id, _set); });
  }

  @Action({ rawError: true })
  public async fetchProblemSets() {
    const response = await axios.get(login_module.api_header + '/sets');
    const _sets  = response.data as ProblemSet[];
    this.setProblemSets(_sets);
  } // fetchProblemSets

  @Mutation
  public async updateProblemSet(_set: ProblemSet) {
    const response = await axios.put(login_module.api_header + '/sets/' + _set.set_id, _set);
    this._problem_sets.set(_set.set_id,_set);
      // tslint:disable-next-line
      console.log(response);
      // we should check that this worked and add a message

  }

  @Mutation
  public async addProblemSet(_set: ProblemSet) {
    const response = await axios.post(login_module.api_header + '/sets/' + _set.set_id, _set);

    // add the new problem set to the _problem_sets;
    this._problem_sets.set(_set.set_id,_set);
    // tslint:disable-next-line
    console.log(response);
    // we should check that this worked and add a message

    return response.data as ProblemSet;
  }

  @Mutation
  public async removeProblemSet(_set: ProblemSet) {
    const response = await axios.delete(login_module.api_header + '/sets/' + _set.set_id);

    this._problem_sets.delete(_set.set_id);

    return response.data as ProblemSet;
  }
}

export default getModule(ProblemSetsModule, store);

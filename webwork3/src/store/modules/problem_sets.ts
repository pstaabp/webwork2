import {VuexModule, Module, Action, Mutation, getModule} from 'vuex-module-decorators';
import {ProblemSet, ProblemSetList} from '@/store/models';
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
  private _problem_sets: ProblemSetList = new Map();

  public get problem_sets() {
    return this._problem_sets;
  }

  public get set_names() {
    return Array.from(this._problem_sets.keys());
  }

  @Action({ rawError: true })
  public async fetchProblemSets() {
    const response = await axios.get(login_module.api_header + '/sets');
    const _sets  = response.data as ProblemSet[];
    _sets.forEach( (_set) => {this.SET_PROBLEM_SET(_set); });

  } // fetchProblemSets

  @Action
  public async updateProblemSet(_set: ProblemSet) {
    const response = await axios.put(login_module.api_header + '/sets/' + _set.set_id, _set);
    this.SET_PROBLEM_SET(response.data as ProblemSet);
  }

  @Action
  public async addProblemSet(_set: ProblemSet) {
    const response = await axios.post(login_module.api_header + '/sets/' + _set.set_id, _set);

    // add the new problem set to the _problem_sets;
    this.SET_PROBLEM_SET(_set);
    // we should check that this worked and add a message
    return response.data as ProblemSet;
  }

  @Action
  public async removeProblemSet(_set: ProblemSet) {
    const response = await axios.delete(login_module.api_header + '/sets/' + _set.set_id);
    this.DELETE_SET(_set);
    return response.data as ProblemSet;
  }

  @Action
  public clearProblemSets() {
    this.RESET_SETS();
  }

  @Mutation
  private SET_PROBLEM_SET(_set: ProblemSet) {
    this._problem_sets.set(_set.set_id, _set);
  }


  @Mutation
  private DELETE_SET(_set: ProblemSet) {
    this._problem_sets.delete(_set.set_id);
  }

  @Mutation
  private RESET_SETS() {
    this._problem_sets = new Map();
  }

}

export default getModule(ProblemSetsModule, store);

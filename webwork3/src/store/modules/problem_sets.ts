import {VuexModule, Module, Action, Mutation, MutationAction, getModule} from 'vuex-module-decorators';
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

  @Mutation
  private ADD_SET(_set: ProblemSet) {
    this._problem_sets.set(_set.set_id,_set);
  }

  @Mutation
  private DELETE_SET(_set: ProblemSet) {
    this._problem_sets.delete(_set.set_id);
  }

  @Action({ rawError: true })
  public async fetchProblemSets() {
    const response = await axios.get(login_module.api_header + '/sets');
    const _sets  = response.data as ProblemSet[];
    this.setProblemSets(_sets);
  } // fetchProblemSets

  @Action
  public async updateProblemSet(_set: ProblemSet) {
    const response = await axios.put(login_module.api_header + '/sets/' + _set.set_id, _set);
    this.ADD_SET(_set);
  }

  @Action
  public async addProblemSet(_set: ProblemSet) {
    const response = await axios.post(login_module.api_header + '/sets/' + _set.set_id, _set);

    // add the new problem set to the _problem_sets;
    this.ADD_SET(_set);
    // we should check that this worked and add a message
    return response.data as ProblemSet;
  }

  @Action
  public async removeProblemSet(_set: ProblemSet) {
    // tslint: disable-next-line
    console.log("in removeProblemSet");
    const response = await axios.delete(login_module.api_header + '/sets/' + _set.set_id);
    // tslint: disable-next-line
    console.log("got response back");

    this.DELETE_SET(_set);

    return response.data as ProblemSet;
  }
}

export default getModule(ProblemSetsModule, store);

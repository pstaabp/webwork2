import {
  VuexModule,
  Module,
  Action,
  Mutation,
} from "vuex-module-decorators";

import { isEqual } from "lodash-es";

import { diff } from "deep-object-diff";

import { parseProblemSet, formatDateTime } from "@/common";

import {
  ProblemSet,
  UserSet,
} from "@/store/models";

import { login_store, messages_store } from "@/store";



import axios from "axios";

function getProperty<T, K extends keyof T>(o: T, _prop_name: K): T[K] {
  return o[_prop_name]; // o[propertyName] is of type T[K]
}

@Module({
  namespaced: true,
  name: "ProblemSetsModule",
  // preserveState: localStorage.getItem("vuex") !== null,
})
export default class ProblemSetsModule extends VuexModule {
  // Note: a ProblemSetList (Map<string,Problem>) is preferrable, but locally saving a Map is not supported well in
  // vuex-persist currently.  TODO: switch over at some point.

  private problem_sets_array: ProblemSet[] = [];
  private user_set_array: UserSet[] = [];

  public get problem_sets(): ProblemSet[] {
    return this.problem_sets_array;
  }

  public get user_sets(): UserSet[] {
    return this.user_set_array;
  }

  public get set_names(): string[] {
    return this.problem_sets_array.map((_set: ProblemSet) => _set.set_id);
  }

  @Action
  public async getProblemSet(_set_id: string): Promise<ProblemSet | undefined> {
    return this.problem_sets_array.find(
      (_set: ProblemSet) => _set.set_id === _set_id
    );
    // console.log(sets); // eslint-disable-line no-console
    // return sets;
  }

  @Action
  public getUserSet(info: {
    user_id: string;
    set_id: string;
  }): UserSet | undefined {
    return this.user_set_array.find(
      (_set: UserSet) =>
        _set.set_id === info.set_id && _set.user_id === info.user_id
    );
  }

  @Action({ rawError: true })
  public async fetchProblemSets(): Promise<void> {
    const response = await axios.get(login_store.api_header + "/sets");
    const sets = response.data as ProblemSet[];
    sets.forEach((_set) => {
      this.SET_PROBLEM_SET(parseProblemSet(_set));
    });
  } // fetchProblemSets

  @Action
  public async updateProblemSet(_set: ProblemSet): Promise<void> {
    const previous_set = await this.getProblemSet(_set.set_id);
    const response = await axios.put(
      login_store.api_header + "/sets/" + _set.set_id,
      _set
    );

    const updated_set = response.data as ProblemSet;
    // check to make sure that the two sets are the same
    if (isEqual(updated_set, _set) && previous_set) {
      const obj_diff = diff(updated_set, previous_set);
      const keys = Object.keys(obj_diff);
      const short = `The properties ${keys} for problem sets ${_set.set_id} changed.`;
      const long =
        "The following properties changed:" +
        keys.reduce(
          (msg: string, key: string) =>
            msg +
            " " +
            key +
            ": from " +
            (/date$/.test(key)
              ? formatDateTime((previous_set[key] as unknown) as number)
              : "from " + previous_set[key]) +
            " to " +
            (/date$/.test(key)
              ? formatDateTime(getProperty(_set, key) as number)
              : getProperty(_set, key)),
          ""
        );
      messages_store.addMessage({ id: -1, short: short, long: long });
      this.SET_PROBLEM_SET(updated_set);
    } else {
      console.log(updated_set); // eslint-disable-line no-console
      console.log(_set); // eslint-disable-line no-console
      console.log(diff(updated_set, _set)); // eslint-disable-line no-console
      console.log(diff(_set, updated_set)); // eslint-disable-line no-console
      // eslint-disable-next-line no-console
      console.error(
        `There was an error saving the problem set: ${_set.set_id}`
      );
    }
  }

  @Action
  public async addProblemSet(_set: ProblemSet): Promise<ProblemSet> {
    const response = await axios.post(
      login_store.api_header + "/sets/" + _set.set_id,
      _set
    );

    // add the new problem set to the problem_sets_array;
    this.SET_PROBLEM_SET(_set);
    // we should check that this worked and add a message
    return response.data as ProblemSet;
  }

  @Action
  public async removeProblemSet(_set: ProblemSet): Promise<ProblemSet> {
    const response = await axios.delete(
      login_store.api_header + "/sets/" + _set.set_id
    );
    this.DELETE_SET(_set);
    return response.data as ProblemSet;
  }

  @Action
  public async fetchUserSets(_user_id: string): Promise<UserSet[]> {
    const response = await axios.get(
      login_store.api_header + "/users/" + _user_id + "/sets"
    );
    const sets = response.data as UserSet[];
    sets.forEach((_set) => this.SET_USER_SET(_set));
    return sets;
  }

  @Action async fetchUserSet(props: {
    user_id: string;
    set_id: string;
  }): Promise<void> {
    const response = await axios.get(
      login_store.api_header +
        "/users/" +
        props.user_id +
        "/sets/" +
        props.set_id
    );
    this.SET_USER_SET(response.data as UserSet);
  }

  @Action
  public clearProblemSets(): void {
    this.RESET_SETS();
  }

  @Mutation
  private SET_USER_SET(set: UserSet): void {
    const index = this.user_set_array.findIndex(
      (_set: UserSet) => _set.set_id == set.set_id
    );
    if (index > -1) {
      this.user_set_array[index] = set;
    } else {
      this.user_set_array.push(set);
    }
  }

  @Mutation
  private SET_PROBLEM_SET(set: ProblemSet) {
    const index = this.problem_sets_array.findIndex(
      (_set: ProblemSet) => _set.set_id == set.set_id
    );
    if (index > -1) {
      this.problem_sets_array[index] = set;
    } else {
      this.problem_sets_array.push(set);
    }
  }

  @Mutation
  private DELETE_SET(set: ProblemSet) {
    const index = this.problem_sets_array.findIndex(
      (_set: ProblemSet) => _set.set_id == set.set_id
    );
    if (index > -1) {
      this.problem_sets_array.splice(index, 1);
    }
  }

  @Mutation
  private RESET_SETS() {
    this.problem_sets_array = [];
  }
}

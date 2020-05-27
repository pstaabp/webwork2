// This is the module related to app state

import {
  VuexModule,
  Module,
  Mutation,
  Action,
  // getModule,
} from "vuex-module-decorators";
import store from "@/store";
import { Dictionary } from "@/store/models";

interface AppState {
  problem_set: string;
  user_id: string;
  current_view: string;
  current_path: string;
}

@Module({
  namespaced: true,
  name: "app_state_module",
  store,
  dynamic: true,
  preserveState: localStorage.getItem("vuex") !== null,
})
export default class AppStateModule extends VuexModule {
  public app_state: AppState = {
    problem_set: "",
    user_id: "",
    current_view: "",
    current_path: "",
  };

  get selected_set() {
    return this.app_state.problem_set;
  }

  get selected_user() {
    return this.app_state.user_id;
  }

  get current_view() {
    return this.app_state.current_view;
  }

  get current_path() {
    return this.app_state.current_path;
  }

  @Action
  public updateAppState(_state: Dictionary<string>) {
    this.SET_APP_STATE(_state);
  }

  // @Action
  // public setSelectedSet(_set_id: string) {
  //   this.SET_PROBLEM_SET(_set_id);
  // }
  //
  // @Action
  // public setSelectedUser(_user_id: string) {
  //   this.SET_USER(_user_id);
  // }
  //
  // @Action
  // public setCurrentView(_view_name: string) {
  //   this.SET_CURRENT_VIEW(_view_name);
  // }
  //
  // @Action
  // public setCurrentPath(_path: string) {
  //   this.SET_CURRENT_PATH(_path);
  // }

  @Mutation
  public SET_APP_STATE(_state: Dictionary<string>) {
    if (_state.current_path) {
      this.app_state.current_path = _state["current_path"];
    }
    if (_state.current_view) {
      this.app_state.current_view = _state["current_view"];
    }
    if (_state.problem_set) {
      this.app_state.problem_set = _state["problem_set"];
    }
    if (_state.user_id) {
      this.app_state.user_id = _state["user_id"];
    }
  }

  // @Mutation
  // public SET_PROBLEM_SET(_set_id: string) {
  //   this.app_state.problem_set = _set_id;
  // }
  //
  // @Mutation
  // public SET_USER(_user_id: string) {
  //   this.app_state.user_id = _user_id;
  // }
  //
  // @Mutation
  // public SET_CURRENT_VIEW(_current_view: string) {
  //   this.app_state.current_view = _current_view;
  // }
  //
  // @Mutation
  // public SET_CURRENT_PATH(_path: string) {
  //   this.app_state.current_path = _path;
  // }
}

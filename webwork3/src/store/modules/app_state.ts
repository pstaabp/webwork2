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
  selected_set: string;
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
    selected_set: "",
    user_id: "",
    current_view: "",
    current_path: "",
  };

  get selected_set(): string {
    return this.app_state.selected_set;
  }

  get selected_user(): string {
    return this.app_state.user_id;
  }

  get current_view(): string {
    return this.app_state.current_view;
  }

  get current_path(): string {
    return this.app_state.current_path;
  }

  @Action
  public updateAppState(_state: Dictionary<string>): void {
    this.SET_APP_STATE(_state);
  }

  @Mutation
  public SET_APP_STATE(_state: Dictionary<string>): void {
    Object.keys(_state).forEach((_key) => {
      if (!Object.keys(this.app_state).includes(_key)) {
        console.log(`The key ${_key} is not valid to set for the app_state`);
      }
    });
    if (_state.current_path) {
      this.app_state.current_path = _state["current_path"];
    }
    if (_state.current_view) {
      this.app_state.current_view = _state["current_view"];
    }
    if (_state.selected_set) {
      this.app_state.selected_set = _state["selected_set"];
    }
    if (_state.user_id) {
      this.app_state.user_id = _state["user_id"];
    }
  }
}

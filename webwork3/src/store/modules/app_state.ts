// This is the module related to app state

import {
  VuexModule,
  Module,
  Mutation,
  Action,
  getModule,
} from "vuex-module-decorators";
import store from "@/store";

// this is to prevent an error occur with a hot reloading.
if (store.state.app_state) {
  store.unregisterModule("app_state");
}

@Module({
  namespaced: true,
  name: "app_state",
  store,
  dynamic: true,
})
export class AppStateModule extends VuexModule {
  private problem_set = "";
  private user = "";
  private current_view_state = "";
  get selected_set() {
    return this.problem_set;
  }

  get selected_user() {
    return this.user;
  }

  get current_view() {
    return this.current_view_state;
  }

  @Action
  public setSelectedSet(_set_id: string) {
    this.SET_PROBLEM_SET(_set_id);
  }

  @Action
  public setSelectedUser(_user_id: string) {
    this.SET_USER(_user_id);
  }

  @Action setCurrentView(_view_name: string) {
    this.SET_CURRENT_VIEW(_view_name);
  }

  @Mutation
  public SET_PROBLEM_SET(_set_id: string) {
    this.problem_set = _set_id;
  }

  @Mutation
  public SET_USER(_user_id: string) {
    this.user = _user_id;
  }

  @Mutation
  public SET_CURRENT_VIEW(_current_view: string) {
    this.current_view_state = _current_view;
  }
}

export default getModule(AppStateModule, store);

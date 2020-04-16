// This is the module related to app state

import {
  VuexModule,
  Module,
  Mutation,
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
  private selected_set_state = "";
  private selected_user_state = "";
  private current_view_state = "";
  private show_set_options_state = false;
  private show_user_options_state = false;

  get selected_set() {
    return this.selected_set_state;
  }

  get selected_user() {
    return this.selected_user_state;
  }

  get current_view() {
    return this.current_view_state;
  }

  get show_set_options() {
    return this.show_set_options_state;
  }

  get show_user_options() {
    return this.show_user_options_state;
  }

  @Mutation
  public setSelectedSet(_set_id: string) {
    this.selected_set_state = _set_id;
  }

  @Mutation
  public setSelectedUser(_user_id: string) {
    this.selected_user_state = _user_id;
  }

  @Mutation
  public setCurrentView(_current_view: string) {
    this.current_view_state = _current_view;
  }

  @Mutation
  public setShowSetOptions(_show: boolean) {
    this.show_set_options_state = _show;
  }

  @Mutation
  public setShowUserOptions(_show: boolean) {
    this.show_user_options_state = _show;
  }
}

export default getModule(AppStateModule, store);

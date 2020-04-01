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
  private _selected_set: string = "";
  private _selected_user: string = "";
  private _current_view: string = "";
  private _show_set_options = false;
  private _show_user_options = false;

  get selected_set() {
    return this._selected_set;
  }

  get selected_user() {
    return this._selected_user;
  }

  get current_view() {
    return this._current_view;
  }

  get show_set_options() {
    return this._show_set_options;
  }

  get show_user_options() {
    return this._show_user_options;
  }

  @Mutation
  public setSelectedSet(_set_id: string) {
    this._selected_set = _set_id;
  }

  @Mutation
  public setSelectedUser(_user_id: string) {
    this._selected_user = _user_id;
  }

  @Mutation
  public setCurrentView(_current_view: string) {
    this._current_view = _current_view;
  }

  @Mutation
  public setShowSetOptions(_show: boolean) {
    this._show_set_options = _show;
  }

  @Mutation
  public setShowUserOptions(_show: boolean) {
    this._show_user_options = _show;
  }
}

export default getModule(AppStateModule, store);

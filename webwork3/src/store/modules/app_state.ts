// This is the module related to app state

import {VuexModule, Module, Mutation, getModule} from 'vuex-module-decorators';
import store from '@/store';

// this is to prevent an error occur with a hot reloading.
if (store.state.app_state) {
  store.unregisterModule('app_state');
}

@Module({
  namespaced: true,
  name: 'app_state',
  store,
  dynamic: true,
})
export class AppStateModule extends VuexModule {

  private _selected_set: string = '';

  get selected_set() {
    return this._selected_set;
  }

  @Mutation
  public setSelectedSet(_set_id: string) {
    this._selected_set = _set_id;
  }

}

export default getModule(AppStateModule, store);

import {VuexModule, Module, Action, Mutation, getModule} from 'vuex-module-decorators';
import {Setting} from '@/store/models';
import store from '@/store';

import {LoginModule} from './login';
const loginModule = getModule(LoginModule);


const name = 'settings';

// this is to prevent an error occur with a hot reloading.

if (store.state[name]) {
  store.unregisterModule(name);
}

const api_url = '/webwork3/api';

import axios from 'axios';


@Module({
  namespaced: true,
  name: 'settings',
  store,
  dynamic: true,
})
export class SettingsModule extends VuexModule {
  private settings: Setting[] = [];

  @Mutation
  public setSettings(_settings: Setting[]) {
    this.settings = _settings;
  }

  // Settings actions
  @Action
  public async fetchSettings() {
    const response = await axios.get(api_url + '/courses/' + loginModule.login_info.course_id + '/settings');
    this.setSettings(response.data as Setting[]);
  } // fetchSettings

}

export default getModule(SettingsModule);

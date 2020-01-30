import {VuexModule, Module, Action, Mutation, getModule} from 'vuex-module-decorators';
import {Setting} from '@/store/models';
import store from '@/store';

import {LoginModule} from './login';
const loginModule = getModule(LoginModule);

// this is to prevent an error occur with a hot reloading.

if (store.state.settings) {
  store.unregisterModule('settings');
}

const api_url = '/webwork3/api';

import axios from 'axios';

export type SettingList = Map<string, Setting>;


@Module({
  namespaced: true,
  name: 'settings',
  store,
  dynamic: true,
})
export class SettingsModule extends VuexModule {
  private _settings: SettingList = new Map();


  public get settings(): SettingList {
    return this._settings;
  }

  public get settings_array(): Setting[] {
    return Array.from(this._settings.values());
  }

  // Settings actions
  @Action
  public async fetchSettings() {
    const response = await axios.get(api_url + '/courses/' + loginModule.login_info.course_id + '/settings');
    const settings = response.data as Setting[];
    settings.forEach( (setting) => {
      this.SET_SETTING(setting);
    });
    return this.settings;
  } // fetchSettings

  @Action
  public async updateSetting(_setting: Setting) {
    const response = await axios.put(api_url + '/courses/' + loginModule.login_info.course_id + '/setting', _setting);
    this.SET_SETTING(response.data as Setting);
      // check that the response is the same as the _settting variable.
      // const keys = Object.keys(_setting.getChanges());
      // tslint:disable-next-line
      // console.log(keys);
      // const _message = `The fields ${keys.join(', ')} have changed. `;
      // this.context.commit('ADD_MESSAGE', new Message({message_id: Math.round(1000000 * Math.random()),
      //     message: _message}));
  }

  @Mutation
  private SET_SETTINGS(_settings: SettingList) {
    this._settings = _settings;
  }

  @Mutation
  private SET_SETTING(_setting: Setting) {
    // find the setting in the settings array
    this._settings.set(_setting.var, _setting);
  }


}

export default getModule(SettingsModule, store);

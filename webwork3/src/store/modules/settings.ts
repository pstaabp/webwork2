import {
  VuexModule,
  Module,
  Action,
  Mutation,
  getModule
} from "vuex-module-decorators";

import { isEqual } from "lodash-es";

import { difference } from '@/common';
import { Setting } from "@/store/models";
import store from "@/store";

import login_store from "./login";
import messages_store from './messages';


// this is to prevent an error occur with a hot reloading.

if (store.state.settings) {
  store.unregisterModule("settings");
}

import axios from "axios";

export type SettingList = Map<string, Setting>;

@Module({
  namespaced: true,
  name: "settings",
  store,
  dynamic: true
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
    const response = await axios.get(login_store.api_header + "/settings");
    const settings = response.data as Setting[];
    settings.forEach(setting => this.SET_SETTING(setting));
    return this.settings;
  } // fetchSettings

  @Action
  public async updateSetting(_setting: Setting) {
    const response = await axios.put(
      login_store.api_header + "/settings/" + _setting.var,
      _setting
    );

    const _updated_setting = response.data as Setting;
    const _prev_setting = this._settings.get(_setting.var);

    if (isEqual(_updated_setting, _setting)) {
      const diff = difference(_setting,_prev_setting);
      const _keys = Object.keys(diff);
      const _message = {
        short: `The setting for ${_setting.var} was changed`,
        long: `The setting for ${_setting.var} was changed from ${_prev_setting.value} to ${_setting.value}.`
      }
      messages_store.addMessage(_message);
      console.log(_message); // eslint-disable-line no-console

      this.SET_SETTING(_setting);
    }
  }

  @Action
  public clearSettings(): void {
    this.RESET_SETTINGS();
  }

  @Mutation
  private RESET_SETTINGS(): void {
    this._settings = new Map();
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

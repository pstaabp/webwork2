import {
  VuexModule,
  Module,
  Action,
  Mutation,
  getModule,
} from "vuex-module-decorators";

import { isEqual } from "lodash-es";

import { Setting } from "@/store/models";
import store from "@/store";

import login_store from "./login";
import messages_store from "./messages";

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
  dynamic: true,
})
export class SettingsModule extends VuexModule {
  private setting_list: SettingList = new Map();

  public get settings(): SettingList {
    return this.setting_list;
  }

  public get settings_array(): Setting[] {
    return Array.from(this.setting_list.values());
  }

  // Settings actions
  @Action
  public async fetchSettings() {
    const response = await axios.get(login_store.api_header + "/settings");
    const settings = response.data as Setting[];
    settings.forEach((setting) => this.SET_SETTING(setting));
    return this.settings;
  } // fetchSettings

  @Action
  public async updateSetting(_setting: Setting) {
    const response = await axios.put(
      login_store.api_header + "/settings/" + _setting.var,
      _setting
    );

    const updated_setting = response.data as Setting;
    const prev_setting = this.setting_list.get(_setting.var);
    let value = "";
    if (prev_setting) {
      value = "" + prev_setting.value;
    }

    if (isEqual(updated_setting, _setting)) {
      const message = {
        id: -1,
        short: `The setting for ${_setting.var} was changed`,
        long: `The setting for ${_setting.var} was changed from ${value} to ${_setting.value}.`,
      };
      messages_store.addMessage(message);

      this.SET_SETTING(_setting);
    }
  }

  @Action
  public clearSettings(): void {
    this.RESET_SETTING();
  }

  @Mutation
  private RESET_SETTING(): void {
    this.setting_list = new Map();
  }

  @Mutation
  private SET_SETTING(_setting: Setting) {
    // find the setting in the settings array
    this.setting_list.set(_setting.var, _setting);
  }
}

export default getModule(SettingsModule, store);

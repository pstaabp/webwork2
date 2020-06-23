import {
  VuexModule,
  Module,
  Action,
  Mutation,
} from "vuex-module-decorators";

import { isEqual } from "lodash-es";
import axios from "axios";

import { Setting } from "@/store/models";

import { login_store, messages_store } from "@/store";

@Module({
  namespaced: true,
  name: "SettingsModule",
  // preserveState: localStorage.getItem("vuex") !== null,
})
export default class SettingsModule extends VuexModule {
  // Note: a SettingList (Map<string,Setting>) is preferrable, but locally saving a Map is not supported well in
  // vuex-persist currently.  TODO: switch over at some point.

  private setting_array: Setting[] = [];

  public get settings(): Setting[] {
    return this.setting_array;
  }

  @Action
  public getSetting(_var_name: string): Setting | undefined {
    return this.setting_array.find(
      (_setting: Setting) => _setting.var == _var_name
    );
  }

  // Settings actions
  @Action
  public async fetchSettings(): Promise<Setting[]> {
    const response = await axios.get(login_store.api_header + "/settings");
    const settings = response.data as Setting[];
    settings.forEach((setting) => this.SET_SETTING(setting));
    return this.settings;
  } // fetchSettings

  @Action
  public async updateSetting(_setting: Setting): Promise<void> {
    const response = await axios.put(
      login_store.api_header + "/settings/" + _setting.var,
      _setting
    );

    const updated_setting = response.data as Setting;
    const prev_setting = this.getSetting(_setting.var);
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
    this.setting_array = [];
  }

  @Mutation
  private SET_SETTING(setting: Setting): void {
    // find the setting in the settings array
    const index = this.setting_array.findIndex(
      (_setting: Setting) => _setting.var === setting.var
    );
    if (index > -1) {
      this.setting_array[index] = setting;
    } else {
      this.setting_array.push(setting);
    }
  }
}

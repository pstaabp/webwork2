// This is the module related to login

import { VuexModule, Module, Mutation, Action } from "vuex-module-decorators";

import { LoginInfo, UserPassword, Dictionary } from "@/store/models";
import store from "@/store";
import axios from "axios";

@Module({
  namespaced: true,
  name: "login_module",
  store,
  dynamic: true,
  preserveState: localStorage.getItem("vuex") !== null,
})
export default class LoginModule extends VuexModule {
  private login_info_state: LoginInfo = {
    user_id: "",
    logged_in: false,
    course_id: "",
    permission: -5,
  };

  public get api_header(): string {
    return "/webwork3/api/courses/" + this.login_info_state.course_id;
  }

  public get login_info(): LoginInfo {
    return this.login_info_state;
  }

  public get course_id(): string {
    return this.login_info_state.course_id;
  }

  @Action
  public async checkPassword(login: UserPassword): Promise<LoginInfo> {
    const login_info: LoginInfo = {
      logged_in: false,
      user_id: login.user_id,
      course_id: login.course_id,
      permission: -5,
    };

    const response = await axios.post(
      "/webwork3/api/courses/" + login_info.course_id + "/login",
      login
    );
    if (response.data.logged_in === 1) {
      login_info.logged_in = true;
      login_info.permission = response.data.permission;
    }
    this.setLoginInfo(login_info);
    return login_info;
  }

  @Action
  public async logout(): Promise<Dictionary<string>> {
    const response = await axios.post(this.api_header + "/logout");
    return response.data;
  }

  @Action
  public clearLogin(): void {
    this.RESET_LOGIN();
  }

  @Mutation
  private setLoginInfo(_info: LoginInfo): void {
    this.login_info_state = _info;
  }

  @Mutation
  private RESET_LOGIN(): void {
    this.login_info_state = {
      user_id: "",
      logged_in: false,
      course_id: "",
      permission: -5,
    };
  }
}

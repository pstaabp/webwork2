// This is the module related to login

import {
  VuexModule,
  Module,
  Mutation,
  Action,
  getModule
} from "vuex-module-decorators";
import { LoginInfo, UserPassword } from "@/store/models";
import store from "@/store";

import Common from "@/common";

// this is to prevent an error occur with a hot reloading.
if (store.state.login) {
  store.unregisterModule("login");
}

import axios from "axios";

@Module({
  namespaced: true,
  name: "login",
  store,
  dynamic: true
})
export class LoginModule extends VuexModule {
  private _login_info: LoginInfo = {
    user_id: "",
    logged_in: false,
    course_id: "",
    user: Common.newUser()
  };

  public get api_header() {
    return "/webwork3/api/courses/" + this._login_info.course_id;
  }

  public get login_info() {
    return this._login_info;
  }

  public get course_id() {
    return this._login_info.course_id;
  }

  @Action
  public async checkPassword(login: UserPassword) {
    const login_info: LoginInfo = {
      logged_in: false,
      user_id: login.user_id,
      course_id: login.course_id,
      user: Common.newUser()
    };

    const response = await axios.post(
      "/webwork3/api/courses/" + login_info.course_id + "/login",
      login
    );
    if (response.data.logged_in === 1) {
      login_info.logged_in = true;
      login_info.user.permission = response.data.permission;
      login_info.user.first_name = response.data.first_name;
      login_info.user.last_name = response.data.last_name;
    }
    this.setLoginInfo(login_info);
    return login_info;
  }

  @Action
  public clearLogin() {
    this.RESET_LOGIN();
  }

  @Mutation
  private setLoginInfo(_info: LoginInfo): void {
    this._login_info = _info;
  }

  @Mutation
  private RESET_LOGIN(): void {
    this._login_info = {
      user_id: "",
      logged_in: false,
      course_id: "",
      user: Common.newUser()
    };
  }
}

export default getModule(LoginModule, store);

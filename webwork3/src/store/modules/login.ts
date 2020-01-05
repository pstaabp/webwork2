// This is the module related to login

import {VuexModule, Module, Mutation, Action, getModule} from 'vuex-module-decorators';
import {LoginInfo, UserPassword} from '@/store/models';
import store from '@/store';

const name = 'login';

// this is to prevent an error occur with a hot reloading.

if (store.state[name]) {
  store.unregisterModule(name);
}


import axios from 'axios';


@Module({
  namespaced: true,
  name: 'login',
  store,
  dynamic: true,
})
export class LoginModule extends VuexModule {
  public login_info: LoginInfo = {user_id: '', logged_in: false, course_id: '', user: {user_id: ''}};

  @Mutation
  public setLoginInfo(_info: LoginInfo): void {
    this.login_info = _info;
  }

  @Action
  public async checkPassword(login: UserPassword) {
    const login_info: LoginInfo = {logged_in: false, user_id: login.user_id,
          course_id: login.course_id, user: {user_id: login.user_id}};

    const response = await axios.post('/webwork3/api/courses/' + login.course_id + '/login', login);
    if (response.data.logged_in === 1) {
      login_info.logged_in = true;
      login_info.user.permission = response.data.permission;
      login_info.user.first_name = response.data.first_name;
      login_info.user.last_name = response.data.last_name;
      this.setLoginInfo(login_info);
    }
    return login_info;

  }

}

export default getModule(LoginModule);

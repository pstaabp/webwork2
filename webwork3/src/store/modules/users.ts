import {VuexModule, Module, Action, Mutation, getModule} from 'vuex-module-decorators';
import {User} from '@/store/models';
import store from '@/store';

//import {LoginModule} from './login';
import login_module from './login';
//const loginModule = getModule(LoginModule);


const name = 'users';

// this is to prevent an error occur with a hot reloading.

if (store.state[name]) {
  store.unregisterModule(name);
}

const api_url = '/webwork3/api';

import axios from 'axios';


@Module({
  namespaced: true,
  name: 'users',
  store,
  dynamic: true,
})
export class UsersModule extends VuexModule {
  private users: Map<string, User> = new Map();

  @Mutation
  public async setUsers(_users: User[]){
    this.users = new Map();
    _users.forEach( (_u) => {this.users.set(_u.user_id, _u); });
  }
  // Settings actions
  @Action
  public async fetchUsers() {
    const response = await axios.get(api_url + '/courses/' + login_module.login_info.course_id + '/users');
    const _users  = response.data as User[];
    this.setUsers(_users);
  }
}

export default getModule(UsersModule);

import {VuexModule, Module, Action, Mutation, getModule} from 'vuex-module-decorators';
import {User} from '@/store/models';
import store from '@/store';

import login_module from './login';


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
  private _users: Map<string, User> = new Map();

  get users() {
    return this._users;
  }

  get users_array() {
    return Array.from(this._users.values());
  }

  @Mutation
  public async setUsers(_users: User[]) {
    this._users = new Map();
    _users.forEach( (_u) => {this._users.set(_u.user_id, _u); });
  }
  // Settings actions
  @Action({ rawError: true })
  public async fetchUsers() {
    const response = await axios.get(login_module.getApiHeader + '/users');
    const _users  = response.data as User[];
    this.setUsers(_users);
  }

  @Mutation
  public async updateUser( _user: User) {
    const response = await axios.put(login_module.getApiHeader + '/users/' + _user.user_id, _user);
    // tslint:disable-next-line
    console.log(response);
    this._users.set(_user.user_id, _user);

  }
}

export default getModule(UsersModule, store);

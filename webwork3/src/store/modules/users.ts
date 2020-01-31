import {VuexModule, Module, Action, Mutation, getModule} from 'vuex-module-decorators';
import axios from 'axios';


import {User, UserList} from '@/store/models';
import store from '@/store';

import login_module from './login';


const name = 'users';

// this is to prevent an error occur with a hot reloading.

if (store.state[name]) {
  store.unregisterModule(name);
}


@Module({
  namespaced: true,
  name: 'users',
  store,
  dynamic: true,
})
export class UsersModule extends VuexModule {
  private _users: UserList = new Map();

  get users() {
    return this._users;
  }

  get users_array() {
    return Array.from(this._users.values());
  }

  @Action
  public async fetchUsers() {
    const response = await axios.get(login_module.api_header + '/users');
    const _users  = response.data as User[];
    this.SET_USERS(_users);
  }

  @Action
  public async updateUser( _user: User) {
    const response = await axios.put(login_module.api_header + '/users/' + _user.user_id, _user);
    // check if everything is okay.
    this.SET_USER(response.data);
  }

  @Action
  public clearUsers() {
    this.RESET_USERS();
  }

  // Mutations
  @Mutation
  private RESET_USERS() {
    this._users = new Map();
  }

  @Mutation
  private async SET_USER( _user: User) {
    this._users.set(_user.user_id, _user);
  }

  @Mutation
  private async SET_USERS(_users: User[]) {
    this._users = new Map();
    _users.forEach( (_u) => {this._users.set(_u.user_id, _u); });
  }
}

export default getModule(UsersModule, store);

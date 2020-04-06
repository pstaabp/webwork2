import {
  VuexModule,
  Module,
  Action,
  Mutation,
  getModule,
} from "vuex-module-decorators";
import axios from "axios";

import { User, UserList } from "@/store/models";
import store from "@/store";

import login_module from "./login";

const name = "users";

// this is to prevent an error occur with a hot reloading.

if (store.state[name]) {
  store.unregisterModule(name);
}

@Module({
  namespaced: true,
  name: "users",
  store,
  dynamic: true,
})
export class UsersModule extends VuexModule {
  private user_list: UserList = new Map();

  get users() {
    return this.user_list;
  }

  get users_array() {
    return Array.from(this.user_list.values());
  }

  @Action
  public async fetchUsers() {
    const response = await axios.get(login_module.api_header + "/users");
    const user_list = response.data as User[];
    this.SET_USERS(user_list);
  }

  @Action async addUser(_user: User) {
    const response = await axios.post(
      login_module.api_header + "/users/" + _user.user_id,
      _user
    );
    // check if everything is okay.
    this.SET_USER(response.data);
  }

  @Action async addUsers(_users: User[]) {
    const response = await axios.post(
      login_module.api_header + "/users",
      _users
    );

    // need to check everything is ok
    if (response) {
      _users.forEach((_u) => {
        this.SET_USER(_u);
      });
    }
  }

  @Action
  public async updateUser(_user: User) {
    const response = await axios.put(
      login_module.api_header + "/users/" + _user.user_id,
      _user
    );
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
    this.user_list = new Map();
  }

  @Mutation
  private async SET_USER(_user: User) {
    this.user_list.set(_user.user_id, _user);
  }

  @Mutation
  private async SET_USERS(_users: User[]) {
    this.user_list = new Map();
    _users.forEach((_u) => {
      this.user_list.set(_u.user_id, _u);
    });
  }
}

export default getModule(UsersModule, store);

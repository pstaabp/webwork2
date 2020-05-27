import {
  VuexModule,
  Module,
  Action,
  Mutation,
  getModule,
} from "vuex-module-decorators";
import axios from "axios";

import { User } from "@/store/models";
import store from "@/store";

import login_module from "@/store/modules/login";
const login_store = getModule(login_module);

@Module({
  namespaced: true,
  name: "users_module",
  store,
  dynamic: true,
  preserveState: localStorage.getItem("vuex") !== null,
})
export default class UsersModule extends VuexModule {
  // Note: a UserList (Map<string,User>) is preferrable, but locally saving a Map is not supported well in
  // vuex-persist currently.  TODO: switch over at some point.

  private user_array: User[] = [];

  get users() {
    return this.user_array;
  }

  get user_names() {
    return this.user_array.map((_user: User) => _user.user_id);
  }

  @Action
  public getUser(_user_id: string) {
    return this.user_array.find((_user: User) => _user.user_id == _user_id);
  }

  @Action
  public async fetchUsers() {
    const response = await axios.get(login_store.api_header + "/users");
    const user_array = response.data as User[];
    this.SET_USERS(user_array);
  }

  @Action async fetchUser(_user_id: string) {
    const response = await axios.get(
      login_store.api_header + "/users/" + _user_id
    );
    this.SET_USER(response.data as User);
  }

  @Action async addUser(_user: User) {
    const response = await axios.post(
      login_store.api_header + "/users/" + _user.user_id,
      _user
    );
    // check if everything is okay.
    this.SET_USER(response.data);
  }

  @Action async addUsers(_users: User[]) {
    const response = await axios.post(
      login_store.api_header + "/users",
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
      login_store.api_header + "/users/" + _user.user_id,
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
    this.user_array = [];
  }

  @Mutation
  private async SET_USER(user: User) {
    const index = this.user_array.findIndex(
      (_set: User) => _set.user_id == user.user_id
    );
    if (index > -1) {
      this.user_array[index] = user;
    } else {
      this.user_array.push(user);
    }
  }

  @Mutation
  private async SET_USERS(_users: User[]) {
    this.user_array = _users;
  }
}

// export default getModule(UsersModule, store);

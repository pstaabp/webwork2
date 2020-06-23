/*  This sets up the vuex store for the webwork app.  See https://vuex.vuejs.org/
   Additionally, there is information on vuex-persist to save the store data
   local under localStore. See https://github.com/championswimmer/vuex-persist

*/

import Vue from "vue";
import Vuex, { Store } from "vuex";
import { getModule } from "vuex-module-decorators";
Vue.use(Vuex);


import AppStateModule from "@/store/modules/app_state";
import LoginModule from "@/store/modules/login";
import UsersModule from "@/store/modules/users";
import MessagesModule from "@/store/modules/messages";
import ProblemSetsModule from "@/store/modules/problem_sets";
import SettingsModule from "@/store/modules/settings";

let app_state_store: AppStateModule;
let login_store: LoginModule;
let users_store: UsersModule;
let messages_store: MessagesModule;
let problem_set_store: ProblemSetsModule;
let settings_store: SettingsModule;


// eslint-disable-next-line @typescript-eslint/no-explicit-any
const initializer = (store: Store<any>) => {
  app_state_store = getModule(AppStateModule, store);
  login_store = getModule(LoginModule, store);
  users_store = getModule(UsersModule, store);
  messages_store = getModule(MessagesModule, store);
  problem_set_store = getModule(ProblemSetsModule, store);
  settings_store = getModule(SettingsModule, store);
};

export default new Store({
  plugins: [initializer], // this wasn't in the doc -- needed
  modules: {
    AppStateModule,
    LoginModule,
    UsersModule,
    ProblemSetsModule,
    SettingsModule,
    MessagesModule,
  },
  state: {},
  mutations: {},
  actions: {},
});

export {
  // initializeStores,
  app_state_store,
  AppStateModule,
  login_store,
  LoginModule,
  users_store,
  UsersModule,
  messages_store,
  MessagesModule,
  problem_set_store,
  ProblemSetsModule,
  settings_store,
  SettingsModule,
};

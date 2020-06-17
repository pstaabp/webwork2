/*  This sets up the vuex store for the webwork app.  See https://vuex.vuejs.org/
   Additionally, there is information on vuex-persist to save the store data
   local under localStore. See https://github.com/championswimmer/vuex-persist

*/

import Vue from "vue";
import Vuex from "vuex";
Vue.use(Vuex);

// import localForage from "localforage";

import VuexPersistence from "vuex-persist";

import {
  Dictionary,
  LoginInfo,
  Message,
  // User,
  UserList,
  ProblemSetList,
  SettingList,
} from "@/store/models";

interface WeBWorKState {
  login_module: { login_info_state: LoginInfo };
  messages_module: { message_list: Message[] };
  problem_sets_module: { problem_sets_list: ProblemSetList };
  settings_module: { setting_list: SettingList };
  users_module: { user_list: UserList };
  app_state_module: { app_state: Dictionary<string> };
}

const rootState: any = {}; // eslint-disable-line @typescript-eslint/no-explicit-any

const vuexPersist = new VuexPersistence<WeBWorKState>({
  storage: window.localStorage,
  // asyncStorage: true,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  // saveState: (key: string, state: { [key2: string]: any }) => {
  //   console.log(state); // eslint-disable-line no-console
  //   const clean_state = {
  //     app_state_module: state.app_state_module,
  //     users_module: {
  //       user_list: Array.from(state.users_module.user_list.values()),
  //     },
  //     messages_module: { message_array: state.messages_module.message_array },
  //     problem_sets_module: {
  //       problem_sets_list: Array.from(
  //         state.problem_sets_module.problem_sets_list.values()
  //       ),
  //     },
  //     settings_module: {
  //       setting_list: Array.from(state.settings_module.setting_list.values()),
  //     },
  //     login_module: { login_info_state: state.login_module.login_info_state },
  //   };
  //   window.localStorage[key] = JSON.stringify(clean_state);
  // },
  // restoreState: (key: string) => {
  //   console.log(window.localStorage.getItem(key)); // eslint-disable-line no-console
  //   const unparsed_state = window.localStorage.getItem(key);
  //   let st;
  //   if (unparsed_state) {
  //     st = JSON.parse(window.localStorage.getItem(key) || "");
  //   }
  //   if (st) {
  //     console.log(st); // eslint-disable-line no-console
  //     return {
  //       app_state_module: st.app_state_module,
  //       users_module: {
  //         user_list: new Map(
  //           st.users_module.user_list.map((obj: User) => [obj.user_id, obj])
  //         ),
  //       },
  //       messages_module: { message_list: [] },
  //       problem_sets_module: {
  //         problem_sets_list: new Map(
  //           st.problem_sets_module.problem_sets_list.map((obj: User) => [
  //             obj.user_id,
  //             obj,
  //           ])
  //         ),
  //       },
  //       settings_module: {
  //         setting_list: new Map(
  //           st.settings_module.setting_list.map((obj: User) => [
  //             obj.user_id,
  //             obj,
  //           ])
  //         ),
  //       },
  //       login_module: st.login_module,
  //     };
  //   } else {
  //     return {
  //       app_state_module: { app_state: {} },
  //       users_module: { user_list: new Map() },
  //       messages_module: { message_list: [] },
  //       problem_sets_module: { problem_sets_list: new Map() },
  //       settings_module: { setting_list: new Map() },
  //       login_module: {
  //         login_info_state: {
  //           user_id: "",
  //           course_id: "",
  //           logged_in: false,
  //           permission: -5,
  //         },
  //       },
  //     };
  //   }
  // },
  // reducer: (state) => {
  //   return {
  //     app_state_module: state.app_state_module,
  //     users_module: state.users_module
  //   };
  // }
});

export default new Vuex.Store<WeBWorKState>({
  plugins: [vuexPersist.plugin],
  state: rootState,
});

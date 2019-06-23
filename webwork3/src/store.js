import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    settings: [],
    users: [],
    problem_sets: [],
    messages: [], // this stores the messages shown in the menu bar when things are saved.
    api_url: "/webwork3/api",
    login_info: {}
  },
  mutations: {
    UPDATE_LOGIN_INFO(state,_info) {
      // copy over only fields in _info and create a new object, so changes are fired.
      var obj = Object.assign({},state.login_info)
      Object.keys(_info).forEach(_key => {
        obj[_key] = _info[_key];
      })
      state.login_info = obj;
    },

    SET_SETTINGS(state,_settings){ state.settings = _settings},
    SET_SETTING(state,_setting){
      const index = state.settings.findIndex( _set => _set.var == _setting.var);
      state.settings[index] = _setting;
    },

    // User mutations

    SET_USERS(state,_users){ state.users = _users;},
    SET_USER(state,_user){
      const index = state.users.findIndex( __user => __user.user_id == _user.user_id);
      state.users[index] = _user;
    },
    ADD_USER(state,_user){
      state.users.push(_user);
    },

    // ProblemSet mutations

    SET_PROBLEM_SETS(state,_sets){ state.problem_sets = _sets},
    ADD_PROBLEM_SET(state,_set) {state.problem_sets.push(_set)},
    REMOVE_PROBLEM_SET(state,_set) {
      state.problem_sets = state.problem_sets.filter(__set => __set.set_id != _set.set_id)
    },
    SET_PROBLEM_SET(state,_set) {
      const index = state.problem_sets.findIndex(__set => __set.set_id == _set.set_id)
      state.problem_sets[index] = _set;
    },

    // messages
    ADD_MESSAGE(state,_msg) {
      state.messages.push(_msg)
    },
    CLEAR_MESSAGES(state) {state.messages = []}
  },
  getters: {
    getUsers: (state) => {   // return a list of all users except proctors
      return state.users.filter(_u => ! /^set_id:/.test(_u.user_id))
      //return state.users;
    },
    getAssignedUsers: (state) => (set_id) => {  // return all non-proctor users assigned to set_id
      const _set = state.problem_sets.find(_set => _set.set_id == set_id)
      return _set ? _set.assigned_users.filter(_u => ! /^set_id:/.test(_u.user_id)) : [];
    },
    getSet: (state) => (set_id) => { // return the set with given set_id
      return state.problem_sets.find(_set => _set.set_id == set_id)
    }
  },
  actions: {
    // login_info

    updateLoginInfo(state,_info){
      state.commit('UPDATE_LOGIN_INFO',_info)
    },

    // Settings actions

    async fetchSettings({state,commit}){
      axios.get(state.api_url + "/courses/"+ state.login_info.course_id + "/settings")
      .then((response) => commit('SET_SETTINGS', response.data))
      .catch(function (error) {
          commit('SET_SETTINGS', []);
        // eslint-disable-next-line
        console.log(error);
      })
    }, // getSettings
    async updateSetting({state,commit},_setting){
      axios.put(state.api_url + "/courses/" + state.login_info.course_id + "/setting",_setting)
      .then((response) => { commit('SET_SETTING',_setting);
        //eslint-disable-next-line
        console.log(response);

        // check that the response is the same as the _settting variable.
      })
      .catch(function (error) {
        // eslint-disable-next-line
        console.log(error);
      })

    }, // updateSetting

    // Users Actions
    async fetchUsers({state,commit}){
      axios.get(state.api_url + "/courses/" + state.login_info.course_id + "/users")
      .then((response) => commit('SET_USERS', response.data))
      .catch(function (error) {
          commit('SET_USERS', []);
        // eslint-disable-next-line
        console.log(error);
      })
    }, // getUsers
    async updateUser({state,commit},_user){
      axios.put(state.api_url + "/courses/" + state.login_info.course_id + "/users/" + _user.user_id,_user)
        .then((response) => { commit('SET_USER',response.data)})
        .catch(function (error) {
          // eslint-disable-next-line
          console.log(error);
        })
    },
    async addUser({state,commit},_user){
      axios.post(state.api_url + "/courses/" + state.login_info.course_id + "/users/" + _user.user_id,_user)
        .then((response) => {commit('ADD_USER',response.data)})
        .catch(function (error) {
          // eslint-disable-next-line
          console.log(error);
        });
    },


    // Problem Set Actions

    async fetchProblemSets({state,commit}){
      axios.get(state.api_url + "/courses/" + state.login_info.course_id + "/sets")
      .then((response) => commit('SET_PROBLEM_SETS', response.data))
      .catch(function (error) {
          commit('SET_PROBLEM_SETS', []);
        // eslint-disable-next-line
        console.log(error);
      })
    }, // fetchProblemSets
    async newProblemSet({state,commit},_set){
      axios.post(state.api_url + "/courses/" + state.login_info.course_id + "/sets/" + _set.set_id,_set)
      .then((response) => commit('ADD_PROBLEM_SET', response.data))
      .catch((error) => {
        // eslint-disable-next-line
        console.log(error);
      })
    }, // newProblemSet
    async removeProblemSet({state,commit},_set){
      axios.delete(state.api_url + "/courses/" + state.login_info.course_id + "/sets/" + _set.set_id)
      .then((response) => commit('REMOVE_PROBLEM_SET',response.data))
      .catch((error) => {
        // eslint-disable-next-line
        console.log(error);
      })
    }, // removeProblemSet
    async updateProblemSet({state,commit},_set){
      axios.put(state.api_url + "/courses/" + state.login_info.course_id + "/sets/" + _set.set_id, _set)
      .then((response) => {
        commit('SET_PROBLEM_SET',response.data)
        commit('ADD_MESSAGE',_set._message_short)
      })
      .catch((error) => {
        // eslint-disable-next-line
        console.log(error);
      })
    },
    
    // Messages
    addMessage(context,_msg){
      context.commit("ADD_MESSAGE",_msg)
    },
    clearMessages(context){
      context.commit('CLEAR_MESSAGES');
    }
  }
})

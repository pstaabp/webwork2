import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    settings: [],  // /webwork3/api/courses/test/settings
    users: [],
    problem_sets: [],
    messages: [], // this stores the messages shown in the menu bar when things are saved.
    api_url: "/webwork3/api"
  },
  mutations: {
    setSettings(state,_settings){ state.settings = _settings},
    setSetting(state,_setting){
      const index = state.settings.findIndex( _set => _set.var == _setting.var);
      state.settings[index] = _setting;
    },

    // User mutations

    setUsers(state,_users){ state.users = _users;},
    setUser(state,_user){
      const index = state.users.findIndex( __user => __user.user_id == _user.user_id);
      state.users[index] = _user;
    },

    // ProblemSet mutations

    setProblemSets(state,_sets){ state.problem_sets = _sets},
    addProblemSet(state,_set) {state.problem_sets.push(_set)},
    deleteProblemSet(state,_set) {
      state.problem_sets = state.problem_sets.filter(__set => __set.set_id != _set.set_id)
    },
    setProblemSet(state,_set) {
      const index = state.problem_sets.findIndex(__set => __set.set_id == _set.set_id)
      state.problem_sets[index] = _set;
    },

    // messages
    addMessage(state,_msg) {state.messages.push(_msg)}
  },
  getters: {
    getUsers: (state) => {   // return a list of all users except proctors
      //return state.users.filter(_u => ! /^set_id:/.test(_u.user_id))
      return state.users;
    },
    getAssignedUsers: (state) => (set_id) => {  // return all non-proctor users assigned to set_id
      const _set = state.problem_sets.find(_set => _set.set_id == set_id)
      return _set ? _set.assigned_users : [];
    }
  },
  actions: {
    // Settings actions

    async fetchSettings({state,commit}){
      axios.get(state.api_url + "/courses/test/settings")
      .then((response) => commit('setSettings', response.data))
      .catch(function (error) {
          commit('setSettings', []);
        // eslint-disable-next-line
        console.log(error);
      })
    }, // getSettings
    async updateSetting({state,commit},_setting){
      axios.put(state.api_url + "/courses/test/setting",_setting)
      .then((response) => { commit('setSetting',_setting);
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
      axios.get(state.api_url + "/courses/test/users")
      .then((response) => commit('setUsers', response.data))
      .catch(function (error) {
          commit('setUsers', []);
        // eslint-disable-next-line
        console.log(error);
      })
    }, // getUsers
    async updateUser({state,commit},_user){
      axios.put(state.api_url + "/courses/test/users/" + _user.user_id,_user)
        .then((response) => { commit('setUser',_user);
          //eslint-disable-next-line
          console.log(response);
        })
        .catch(function (error) {
          // eslint-disable-next-line
          console.log(error);
        })
    },


    // Problem Set Actions

    async fetchProblemSets({state,commit}){
      axios.get(state.api_url + "/courses/test/sets")
      .then((response) => commit('setProblemSets', response.data))
      .catch(function (error) {
          commit('setProblemSets', []);
        // eslint-disable-next-line
        console.log(error);
      })
    }, // fetchProblemSets
    async newProblemSet({state,commit},_set){
      axios.post(state.api_url + "/courses/test/sets/" + _set.set_id,_set)
      .then((response) => commit('addProblemSet', response.data))
      .catch((error) => {
        // eslint-disable-next-line
        console.log(error);
      })
    }, // newProblemSet
    async removeProblemSet({state,commit},_set){
      axios.delete(state.api_url + "/courses/test/sets/" + _set.set_id)
      .then((response) => commit('deleteProblemSet',response.data))
      .catch((error) => {
        // eslint-disable-next-line
        console.log(error);
      })
    }, // removeProblemSet
    async updateProblemSet({state,commit},_set){
      axios.put(state.api_url + "/courses/test/sets/" + _set.set_id, _set)
      .then((response) => {
        commit('setProblemSet',response.data)
        commit('addMessage',_set._msg)
        // eslint-disable-next-line
        console.log(_set._msg)
      })
      .catch((error) => {
        // eslint-disable-next-line
        console.log(error);
      })
    }
  }
})

import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    settings: [],  // /webwork3/api/courses/test/settings
    users: [],
    problem_sets: [],
    api_url: "/webwork3/api"
  },
  mutations: {
    setSettings(state,_settings){ state.settings = _settings},
    setSetting(state,_setting){
      const index = state.settings.findIndex( (_set) => _set.var == _setting.var);
      state.settings[index] = _setting;
    },
    setUsers(state,_users){ state.users = _users;},
    setUser(state,_user){
      const index = state.users.findIndex( (_u) => _u.user_id == _user.user_id);
      state.users[index] = _user;
    },
    setProblemSets(state,_sets){ state.problem_sets = _sets},

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
    }, // getUsers

  }
})

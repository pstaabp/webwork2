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
    setUsers(state,_users){ state.users = _users;},
    setProblemSets(state,_sets){ state.problem_sets = _sets}
  },
  actions: {
    async fetchSettings({state,commit}){
      axios.get(state.api_url + "/courses/test/settings")
      .then((response) => commit('setSettings', response.data))
      .catch(function (error) {
          commit('setSettings', []);
        // eslint-disable-next-line
        console.log(error);
      })
    }, // getSettings
    async fetchUsers({state,commit}){
      axios.get(state.api_url + "/courses/test/users")
      .then((response) => commit('setUsers', response.data))
      .catch(function (error) {
          commit('setUsers', []);
        // eslint-disable-next-line
        console.log(error);
      })
    }, // getUsers
    async fetchProblemSets({state,commit}){
      axios.get(state.api_url + "/courses/test/sets")
      .then((response) => commit('setProblemSets', response.data))
      .catch(function (error) {
          commit('setProblemSets', []);
        // eslint-disable-next-line
        console.log(error);
      })
    }, // getUsers
    async updateSetting({state,commit},_setting){
      // eslint-disable-next-line
      console.log(state);
      // eslint-disable-next-line
      console.log(commit);
      axios.put(state.api_url + "/courses/test/setting",_setting)
      .then((response) => {
        //eslint-disable-next-line
        console.log(response);

        // check that the response is the same as the _settting variable. 
      })
      .catch(function (error) {
        // eslint-disable-next-line
        console.log(error);
      })

    } // setSetting
  }
})

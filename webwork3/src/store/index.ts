import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

interface StateMap {
  [key: string]: string;
}

const init_state: StateMap = {};

export default new Vuex.Store({
  state: init_state,
  mutations: {},
  actions: {},
});

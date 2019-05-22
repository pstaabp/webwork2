import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

import '@fortawesome/fontawesome-free/css/all.css'
import '../public/css/webwork.css'

import Vue from 'vue'

//import VuexORM from '@vuex-orm/core'
//import VuexORMAxios from '@vuex-orm/plugin-axios'
import BootstrapVue from 'bootstrap-vue'
//import VueNestable from 'vue-nestable'

Vue.use(BootstrapVue);
//Vue.use(VueNestable);

import App from './App.vue'

new Vue({
  render: h => h(App)
}).$mount('#app')

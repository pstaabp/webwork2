import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

import '@fortawesome/fontawesome-free/css/all.css'
import '../public/css/webwork.css'

import Vue from 'vue'

import BootstrapVue from 'bootstrap-vue'

Vue.use(BootstrapVue);

import App from './App.vue'

import store from './store'

new Vue({
  store,
  render: h => h(App)
}).$mount('#app')

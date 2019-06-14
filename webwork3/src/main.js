import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

import '@fortawesome/fontawesome-free/css/all.css'
import '../public/css/webwork.css'

import Vue from 'vue'


// import Manager from '@/Manager.vue'
// import Login from '@/components/Login'

import router from './router.js'
//
// const router = new VueRouter({
//   mode: 'history',
//   routes: [
//     {
//       path: 'courses/:course_id/manager/',
//       component: Manager,
//       props: (route) => ({ params: route.params })
//     },
//     {
//       path: 'courses/:course_id/login',
//       component: Login,
//       props: (route) => ({params: route.params})
//     }
//   ]
// });
//

import BootstrapVue from 'bootstrap-vue'

Vue.use(BootstrapVue);

import App from './App.vue'

import store from './store'

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')

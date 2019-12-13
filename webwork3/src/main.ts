import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-vue/dist/bootstrap-vue.css';

// import '@fortawesome/fontawesome-free/css/all.css'
import '../public/css/webwork.css';

// import only needed font-awesome icons:
import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

// import { faCalendar, faUsers, faInfoCircle, faUniversity, faListAlt, faEdit,
//          faChartBar, faExchangeAlt, faCogs} from '@fortawesome/free-solid-svg-icons'
import {faCalendar } from '@fortawesome/free-solid-svg-icons/faCalendar';

// seems to be a bug in using
// import { faCalendar, faUsers, faInfoCircle, faUniversity, faListAlt, faEdit,
//          faChartBar, faExchangeAlt, faCogs} from '@fortawesome/free-solid-svg-icons'

// so we need to load each one separately in order to reduce files size.

import {faUsers } from '@fortawesome/free-solid-svg-icons/faUsers';
import {faInfoCircle } from '@fortawesome/free-solid-svg-icons/faInfoCircle';
import {faUniversity } from '@fortawesome/free-solid-svg-icons/faUniversity';
import {faListAlt } from '@fortawesome/free-solid-svg-icons/faListAlt';
import {faEdit } from '@fortawesome/free-solid-svg-icons/faEdit';
import {faChartBar } from '@fortawesome/free-solid-svg-icons/faChartBar';
import {faExchangeAlt } from '@fortawesome/free-solid-svg-icons/faExchangeAlt';
import {faCogs } from '@fortawesome/free-solid-svg-icons/faCogs';
import {faCog} from '@fortawesome/free-solid-svg-icons/faCog';
import {faSignOutAlt} from '@fortawesome/free-solid-svg-icons/faSignOutAlt';
import {faPlus} from '@fortawesome/free-solid-svg-icons/faPlus';
import {faPencilAlt} from '@fortawesome/free-solid-svg-icons/faPencilAlt';
import {faSync} from '@fortawesome/free-solid-svg-icons/faSync';
import {faTrashAlt} from '@fortawesome/free-solid-svg-icons/faTrashAlt';
import {faCheck} from '@fortawesome/free-solid-svg-icons/faCheck';
import {faFile} from '@fortawesome/free-solid-svg-icons/faFile';
import {faBullseye} from '@fortawesome/free-solid-svg-icons/faBullseye';
import {faArrowsAltV} from '@fortawesome/free-solid-svg-icons/faArrowsAltV';
import {faQuestionCircle} from '@fortawesome/free-solid-svg-icons/faQuestionCircle';
import {faWindowClose} from '@fortawesome/free-solid-svg-icons/faWindowClose';

library.add(faCalendar, faUsers, faInfoCircle, faUniversity, faListAlt, faEdit, faChartBar,
              faExchangeAlt, faCogs, faCog, faSignOutAlt, faPlus, faPencilAlt, faSync,
            faTrashAlt, faCheck, faFile, faBullseye, faArrowsAltV, faQuestionCircle,
            faWindowClose);

import Vue from 'vue';

Vue.component('font-awesome-icon', FontAwesomeIcon);

import router from './router';

// import only the necessary element from bootstrap-vue

import { NavbarPlugin, NavPlugin, LayoutPlugin, ListGroupPlugin, FormPlugin, FormGroupPlugin,
         FormInputPlugin, ButtonPlugin, ButtonGroupPlugin, BadgePlugin, ModalPlugin,
          ButtonToolbarPlugin, InputGroupPlugin, FormSelectPlugin, TablePlugin, PaginationPlugin,
          TabsPlugin, FormCheckboxPlugin, SpinnerPlugin, FormFilePlugin } from 'bootstrap-vue';

Vue.use(NavbarPlugin);
Vue.use(NavPlugin);
Vue.use(LayoutPlugin);
Vue.use(ListGroupPlugin);
Vue.use(FormPlugin);
Vue.use(FormGroupPlugin);
Vue.use(FormInputPlugin);
Vue.use(ButtonPlugin);
Vue.use(ButtonGroupPlugin);
Vue.use(BadgePlugin);
Vue.use(ModalPlugin);
Vue.use(ButtonToolbarPlugin);
Vue.use(InputGroupPlugin);
Vue.use(FormSelectPlugin);
Vue.use(TablePlugin);
Vue.use(PaginationPlugin);
Vue.use(TabsPlugin);
Vue.use(FormCheckboxPlugin);
Vue.use(SpinnerPlugin);
Vue.use(FormFilePlugin);

 // import BootstrapVue from 'bootstrap-vue'
 //
 // Vue.use(BootstrapVue)


import App from './App.vue';

import WeBWorKStore from './store';
import Vuex from 'vuex';

const store = new Vuex.Store({
  modules: {
    myMod: WeBWorKStore,
  },
});


new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount('#app');

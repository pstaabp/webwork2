import "bootstrap/dist/css/bootstrap.css";
import "bootstrap-vue/dist/bootstrap-vue.css";

import "../public/css/webwork.css";

import Vue from "vue";

import router from "./router";

// import only the necessary element from bootstrap-vue

import {
  NavbarPlugin,
  NavPlugin,
  LayoutPlugin,
  ListGroupPlugin,
  FormPlugin,
  FormGroupPlugin,
  FormInputPlugin,
  ButtonPlugin,
  ButtonGroupPlugin,
  BadgePlugin,
  ModalPlugin,
  ButtonToolbarPlugin,
  InputGroupPlugin,
  FormSelectPlugin,
  TablePlugin,
  PaginationPlugin,
  TabsPlugin,
  FormCheckboxPlugin,
  SpinnerPlugin,
  FormFilePlugin,
  IconsPlugin,
} from "bootstrap-vue";

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
Vue.use(IconsPlugin);

import WeBWorKApp from "@/App.vue";

import store from "@/store";

new Vue({
  router,
  store,
  render: (h) => h(WeBWorKApp),
}).$mount("#app");

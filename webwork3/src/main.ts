import "bootstrap/dist/css/bootstrap.css";
import "bootstrap-vue/dist/bootstrap-vue.css";

import "../public/css/webwork.css";

import Vue from "vue";

import router from "./router";

// import only the necessary element from bootstrap-vue

import {
  BNavbar,
  BNavbarNav,
  BNavbarBrand,
  BNavbarToggle,
  BCollapse,
  BNavItem,
  BNavItemDropdown,
  BNavText,
  BContainer,
  BCol,
  BRow,
  BListGroup,
  BListGroupItem,
  BFormGroup,
  BFormText,
  BFormTextarea,
  BFormInput,
  BFormSelect,
  BFormCheckbox,
  BFormCheckboxGroup,
  BInputGroup,
  BInputGroupText,
  BInputGroupAppend,
  BButtonGroup,
  BButton,
  BButtonToolbar,
  IconsPlugin,
  BDropdown,
  BDropdownItem,
  BDropdownText,
  BDropdownDivider,
  ModalPlugin,
  BBadge,
  BTable,
  BPagination,
  BTab,
  BTabs,
  BFormFile,
  BSpinner
} from "bootstrap-vue";

Vue.component('b-navbar', BNavbar);
Vue.component('b-navbar-nav', BNavbarNav);
Vue.component('b-navbar-brand', BNavbarBrand);
Vue.component('b-navbar-toggle', BNavbarToggle);
Vue.component('b-nav-item', BNavItem);
Vue.component('b-nav-text', BNavText);
Vue.component('b-nav-item-dropdown',BNavItemDropdown);
Vue.component('b-collapse', BCollapse);
Vue.component('b-form-group', BFormGroup);
Vue.component('b-container',BContainer);
Vue.component('b-col',BCol);
Vue.component('b-row',BRow);
Vue.component('b-list-group', BListGroup);
Vue.component('b-list-group-item', BListGroupItem);
Vue.component('b-text', BFormText);
Vue.component('b-textarea', BFormTextarea);
Vue.component('b-select',BFormSelect);
Vue.component('b-checkbox',BFormCheckbox);
Vue.component('b-checkbox-group',BFormCheckboxGroup);
Vue.component('b-input',BFormInput);
Vue.component('b-input-group',BInputGroup);
Vue.component('b-input-group-text',BInputGroupText);
Vue.component('b-input-group-append',BInputGroupAppend);
Vue.component('b-btn-group',BButtonGroup);
Vue.component('b-btn',BButton);
Vue.component('b-btn-toolbar',BButtonToolbar);
Vue.component('b-dd', BDropdown);
Vue.component('b-dd-item', BDropdownItem);
Vue.component('b-dd-text', BDropdownText);
Vue.component('b-dd-divider',BDropdownDivider);
Vue.component('b-badge',BBadge);
Vue.component('b-table', BTable);
Vue.component('b-pagination', BPagination);
Vue.component('b-tabs', BTabs);
Vue.component('b-tab', BTab);
Vue.component('b-form-file',BFormFile);
Vue.component('b-spinner',BSpinner);

Vue.use(ModalPlugin);
Vue.use(IconsPlugin);

import WeBWorKApp from "@/App.vue";

import store from "@/store";

new Vue({
  router,
  store,
  render: (h) => h(WeBWorKApp),
}).$mount("#app");

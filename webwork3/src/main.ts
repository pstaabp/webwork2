

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
  BFormSelectOption,
  BFormCheckbox,
  BFormCheckboxGroup,
  BInputGroup,
  BInputGroupText,
  BInputGroupAppend,
  BButtonGroup,
  BButton,
  BButtonToolbar,
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
  BSpinner,
  BProgress,
  BPopover,
} from "bootstrap-vue";

Vue.component("BNavbar", BNavbar);
Vue.component("BNavbarNav", BNavbarNav);
Vue.component("BNavbarBrand", BNavbarBrand);
Vue.component("BNavbarToggle", BNavbarToggle);
Vue.component("BNavItem", BNavItem);
Vue.component("BNavText", BNavText);
Vue.component("BNavItemDropdown", BNavItemDropdown);
Vue.component("BCollapse", BCollapse);
Vue.component("BFormGroup", BFormGroup);
Vue.component("BContainer", BContainer);
Vue.component("BCol", BCol);
Vue.component("BRow", BRow);
Vue.component("BListGroup", BListGroup);
Vue.component("BListGroupItem", BListGroupItem);
Vue.component("BText", BFormText);
Vue.component("BTextarea", BFormTextarea);
Vue.component("BSelect", BFormSelect);
Vue.component("BSelectOption", BFormSelectOption);
Vue.component("BCheckbox", BFormCheckbox);
Vue.component("BCheckboxGroup", BFormCheckboxGroup);
Vue.component("BInput", BFormInput);
Vue.component("BInputGroup", BInputGroup);
Vue.component("BInputGroupText", BInputGroupText);
Vue.component("BInputGroupAppend", BInputGroupAppend);
Vue.component("BBtnGroup", BButtonGroup);
Vue.component("BBtn", BButton);
Vue.component("BBtnToolbar", BButtonToolbar);
Vue.component("BDd", BDropdown);
Vue.component("BDdItem", BDropdownItem);
Vue.component("BDdText", BDropdownText);
Vue.component("BDdDivider", BDropdownDivider);
Vue.component("BBadge", BBadge);
Vue.component("BTable", BTable);
Vue.component("BPagination", BPagination);
Vue.component("BTabs", BTabs);
Vue.component("BTab", BTab);
Vue.component("BFormFile", BFormFile);
Vue.component("BSpinner", BSpinner);
Vue.component("BProgress", BProgress);
Vue.component("BPopover", BPopover);

Vue.use(ModalPlugin);

import store from "@/store";

import WeBWorKApp from "@/App.vue";

new Vue({
  router,
  store,
  render: (h) => h(WeBWorKApp),
}).$mount("#app");

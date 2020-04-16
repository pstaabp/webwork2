import "bootstrap/dist/css/bootstrap.css";
import "bootstrap-vue/dist/bootstrap-vue.css";

import "../public/css/webwork.css";

import Vue from "vue";
import * as moment from "moment";

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

// overall filters:

import { ProblemSet } from "@/store/models";

Vue.filter("formatDateTime", (value: number) =>
  moment.unix(value).format("YYYY-MM-DD[T]HH:mm")
);

function parseDatetimeForBrowser(dateString: string) {
  return moment.default(dateString, "YYYY-MM-DD[T]HH:mm").unix();
}

Vue.filter(
  "setReducedScoringDate",
  (_set: ProblemSet, date_string: string) =>
    (_set.reduced_scoring_date = parseDatetimeForBrowser(date_string))
);

Vue.filter(
  "setDueDate",
  (_set: ProblemSet, date_string: string) =>
    (_set.due_date = parseDatetimeForBrowser(date_string))
);

Vue.filter(
  "setAnswerDate",
  (_set: ProblemSet, date_string: string) =>
    (_set.answer_date = parseDatetimeForBrowser(date_string))
);

Vue.filter("validReducedScoring", (_set: ProblemSet) =>
  moment
    .unix(_set.reduced_scoring_date!)
    .isSameOrAfter(moment.unix(_set.open_date!))
);

Vue.filter("validDueDate", (_set: ProblemSet) =>
  moment
    .unix(_set.due_date!)
    .isSameOrAfter(moment.unix(_set.reduced_scoring_date!))
);

Vue.filter("validAnswerDate", (_set: ProblemSet) =>
  moment.unix(_set.answer_date!).isSameOrAfter(moment.unix(_set.due_date!))
);

import WeBWorKApp from "@/App.vue";

import store from "@/store";

new Vue({
  router,
  store,
  render: (h) => h(WeBWorKApp),
}).$mount("#app");

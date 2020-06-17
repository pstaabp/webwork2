<!-- LibraryBrowser.vue

This is the view that conains all library browser functionality -->

<script lang="ts">
import { Vue, Component, Watch } from "vue-property-decorator";

import LibraryTab from "./LibraryComponents/LibraryTab.vue";

import { getModule } from "vuex-module-decorators";

import problem_set_module from "@/store/modules/problem_sets";
const problem_set_store = getModule(problem_set_module);
import app_state_module from "@/store/modules/app_state";
const app_state = getModule(app_state_module);

@Component({
  name: "SetDetails",
  components: {
    LibraryTab,
  },
})
export default class LibraryBrowser extends Vue {
  private tab_index = 0;
  private tabs = [
    "subjects",
    "directory",
    "textbooks",
    "local",
    "setdefn",
    "search",
    "pending",
  ];
  private tab_titles = [
    "Subjects",
    "Directory",
    "Textbooks",
    "Local",
    "Set Definition",
    "Search",
    "Pending",
  ];

  private get problem_set() {
    return problem_set_store.getProblemSet(app_state.selected_set);
  }

  @Watch("tab_index")
  private tabIndexChanged() {
    this.$router.push({
      name: "library-tabs",
      params: { tabname: this.tabs[this.tab_index] },
    });
  }

  // this handles the route names and the tabs
  @Watch("$route", { immediate: true })
  private routeChanged() {
    if (typeof this.$route.name === "undefined") {
      return;
    }

    if (this.$route.name === "library") {
      this.$router.replace({
        name: "library-tabs",
        params: { tabname: "subjects" },
      });
      this.tab_index = 0;
    } else if (this.$route.name === "library-tabs") {
      console.log(this.$route.params); // eslint-disable-line no-console
    }
  }
}
</script>

<template>
  <b-tabs v-model="tab_index" content-class="mt-3">
    <b-tab v-for="(title, i) in tab_titles" :key="title" :title="title">
      <library-tab :tab_name="tabs[i]" />
    </b-tab>
  </b-tabs>
</template>

<!-- LibraryBrowser.vue

This is the view that conains all library browser functionality -->

<script lang="ts">
import { Vue, Component, Watch } from "vue-property-decorator";

import LibraryTab from "./LibraryComponents/LibraryTab.vue";

// set up the store
import problem_sets_store from "@/store/modules/problem_sets";
import app_state from "@/store/modules/app_state";

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
    return problem_sets_store.problem_sets.get(app_state.selected_set);
  }

  @Watch("tab_index")
  private tabIndexChanged() {
    if ("library-" + this.tabs[this.tab_index] !== this.$route.name) {
      this.$router.replace({ name: "library-" + this.tabs[this.tab_index] });
    }
  }

  // this handles the route names and the tabs
  @Watch("$route", { immediate: true })
  private routeChanged() {
    const route_name = this.$route.name;
    const storage_name = localStorage.getItem("library_tab");
    if (typeof name === "undefined") {
      return;
    }
    if (name === "library") {
      if (storage_name) {
        this.$router.replace({ name: storage_name });
      } else {
        this.$router.replace({ name: "library-subjects" });
        this.tab_index = 0;
        localStorage.setItem("library_tab", "library-subjects");
      }
    } else if (route_name && /^library-/.test(route_name)) {
      this.tab_index = this.tabs.findIndex(
        (_name: string) => _name === route_name.split("-")[1]
      );
      localStorage.setItem("library_tab", route_name);
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

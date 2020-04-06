<!-- LibraryBrowser.vue

This is the view that conains all library browser functionality -->

<script lang="ts">
import { Vue, Component } from "vue-property-decorator";

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
  private get problem_set() {
    return problem_sets_store.problem_sets.get(app_state.selected_set);
  }
}
</script>

<template>
  <b-tabs content-class="mt-3">
    <b-tab title="By Subj." active>
      <library-tab tab_name="subjects" :problem_set="problem_set" />
    </b-tab>
    <b-tab title="By Directory">
      <library-tab tab_name="directory" />
    </b-tab>
    <b-tab title="Textbooks">
      <library-tab tab_name="textbooks" />
    </b-tab>
    <b-tab title="Local Prob.">
      <library-tab tab_name="local" />
    </b-tab>
    <b-tab title="Set Defn. files"><h3>Browse Set Definition Files</h3></b-tab>
    <b-tab title="Search"><h3>Search the Library</h3></b-tab>
    <b-tab title="Pending"><h3>Browse pending problems</h3></b-tab>
  </b-tabs>
</template>

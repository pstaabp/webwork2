<!-- ProblemSetSidebar.vue

This is the Sidebar to allow changes to the selected problem set in many different views. -->

<script lang="ts">
import { Component, Watch, Vue } from "vue-property-decorator";

import problem_set_store from "@/store/modules/problem_sets";
import app_state from "@/store/modules/app_state";

@Component({ name: "ProblemSetSidebar" })
export default class ProblemSetSidebar extends Vue {
  private set_id = "";

  private get problem_sets_names() {
    return Array.from(problem_set_store.problem_sets.keys());
  }

  private beforeMount() {
    if (app_state.selected_set) {
      this.set_id = app_state.selected_set;
    }
  }

  @Watch("set_id")
  private setIDChanged() {
    app_state.setSelectedSet(this.set_id);
  }
}
</script>
<template>
  <b-container>
    <b-form-group label="Selected Problem Set">
      <b-select v-model="set_id" :options="problem_sets_names">
        <template #first>
          <b-select-option value="" disabled
            >Please select a set</b-select-option
          >
        </template>
      </b-select>
    </b-form-group>
  </b-container>
</template>

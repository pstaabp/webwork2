<!-- ProblemSetSidebar.vue

This is the Sidebar to allow changes to the selected problem set in many different views. -->

<script lang="ts">
import { Component, Watch, Vue } from "vue-property-decorator";

import { problem_set_store, app_state_store } from "@/store";

@Component({ name: "ProblemSetSidebar" })
export default class ProblemSetSidebar extends Vue {
  private set_id = "";

  private get problem_sets_names() {
    return problem_set_store.set_names;
  }

  private beforeMount() {
    if (app_state_store.selected_set) {
      this.set_id = app_state_store.selected_set;
    }
  }

  private created() {
    this.$store.subscribe((mutation) => {
      // if the select set in the app_state_store changes
      if (mutation.type === "app_state_store_module/SET_APP_STATE") {
        this.set_id = app_state_store.selected_set;
      }
    });
  }

  @Watch("set_id")
  private setIDChanged() {
    app_state_store.updateAppState({ selected_set: this.set_id });
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

<!-- ProblemSetView.vue

This is the View for a Problem Set.  It contains other compoents as tabs. -->

<script lang="ts">
import { Component, Watch } from "vue-property-decorator";
import { mixins } from "vue-class-component";

import SetInfo from "./ProblemSetViewComponents/SetInfo.vue";
import GatewayInfo from "./ProblemSetViewComponents/GatewayInfo.vue";
import ProblemListView from "./ProblemSetViewComponents/ProblemListView.vue";
import AssignUsers from "./ProblemSetViewComponents/AssignUsers.vue";
import SetHeaders from "./ProblemSetViewComponents/SetHeaders.vue";

import { ProblemSet } from "@/store/models";
import { newProblemSet } from "@/common";

import ProblemSetMixin from "@/mixins/problem_set_mixin";

// set up the store
import problem_sets_store from "@/store/modules/problem_sets";
import app_state from "@/store/modules/app_state";

@Component({
  name: "ProblemSetView",
  components: {
    SetInfo,
    GatewayInfo,
    ProblemListView,
    AssignUsers,
    SetHeaders,
  },
})
export default class ProblemSetView extends mixins(ProblemSetMixin) {
  private problem_set: ProblemSet = newProblemSet();

  private get problem_sets_array() {
    return Array.from(problem_sets_store.problem_sets.values());
  }

  private get problem_sets_names() {
    return Array.from(problem_sets_store.problem_sets.keys());
  }

  private get is_gateway() {
    return (
      this.problem_set.assignment_type === "gateway" ||
      this.problem_set.assignment_type === "proctored_gateway"
    );
  }

  @Watch("problem_set")
  private problemSetChanged(){
    console.log("in ProblemSetView set changed"); // eslint-disable-line no-console
  }

  private created() {
    // watch for changes in the selected set from the menu bar or as a link from another part of the app.
    this.$store.subscribe((mutation) => {
      if (mutation.type === "app_state/setSelectedSet") {
        if (
          this.$route.params &&
          this.$route.params.set_id !== app_state.selected_set
        ) {
          this.$router.push({
            name: "setview",
            params: { set_id: app_state.selected_set },
          });
        }
      }
    });
  }

  // TODO: changing "any" below to "Route" returns an error.  Why, not sure.

  // handles changes to the route which is the set-view route.
  @Watch("$route", { immediate: true, deep: true })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private routeChanged(to: any) {
    if (to.name === "setview") {
      const set_id = to.params && to.params.set_id;
      if (set_id) {
        app_state.setSelectedSet(set_id);
        const set = problem_sets_store.problem_sets.get(set_id);
        if (set) {
          Object.assign(this.problem_set, set);
        }
      }
    }
  }
} // class SetDetails
</script>

<template>
  <b-container>
    <b-tabs content-class="mt-3">
      <b-tab title="Set Details" active>
        <set-info
          :problem_sets="problem_sets_array"
          :selected_set="problem_set"
        />
      </b-tab>
      <b-tab title="Gateway Info" :disabled="!is_gateway">
        <gateway-info :selected_set="problem_set" />
      </b-tab>
      <b-tab title="Problems">
        <problem-list-view :problem_set="problem_set" />
      </b-tab>
      <b-tab title="Assign Users">
        <assign-users :problem_set="problem_set" />
      </b-tab>
      <b-tab title="Set Headers">
        <set-headers :problem_set="problem_set" />
      </b-tab>
    </b-tabs>
  </b-container>
</template>

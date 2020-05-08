<!-- ProblemSetView.vue

This is the View for a Problem Set.  It contains other compoents as tabs. -->

<script lang="ts">
import { Component, Watch, Vue } from "vue-property-decorator";

import SetInfo from "./ProblemSetViewComponents/SetInfo.vue";
import GatewayInfo from "./ProblemSetViewComponents/GatewayInfo.vue";
import ProblemListView from "./ProblemSetViewComponents/ProblemListView.vue";
import AssignUsers from "./ProblemSetViewComponents/AssignUsers.vue";
import SetHeaders from "./ProblemSetViewComponents/SetHeaders.vue";
import ProblemSetSidebar from "@/components/sidebars/ProblemSetSidebar.vue";

import { ProblemSet } from "@/store/models";
import { newProblemSet } from "@/common";

// set up the store
import problem_set_store from "@/store/modules/problem_sets";
import app_state from "@/store/modules/app_state";

@Component({
  name: "ProblemSetView",
  components: {
    ProblemSetSidebar,
    SetInfo,
    GatewayInfo,
    ProblemListView,
    AssignUsers,
    SetHeaders,
  },
})
export default class ProblemSetView extends Vue {
  private problem_set: ProblemSet = newProblemSet();

  // private get selected_set_id() {
  //   return app_state.selected_set;
  // }

  private get problem_sets_array() {
    return Array.from(problem_set_store.problem_sets.values());
  }

  private get is_gateway() {
    return (
      this.problem_set.assignment_type === "gateway" ||
      this.problem_set.assignment_type === "proctored_gateway"
    );
  }

  // @Watch("selected_set_id")
  // private setIDchanged() {
  //   console.log(this.selected_set_id); // eslint-disable-line no-console
  // }

  private created() {
    // if the selectedSet in the menu bar is given, then switch the route.
    this.$store.subscribe((mutation) => {
      if (
        mutation.type === "app_state/SET_PROBLEM_SET" &&
        this.$route.name &&
        /^set-view/.test(this.$route.name)
      ) {
        if (app_state.selected_set !== this.$route.params.set_id) {
          this.$router.push({
            name: "set-view-tabs",
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
    console.log(to); // eslint-disable-line no-console
    if (to.name === "set-view-tabs") {
      const set_id = to.params && to.params.set_id;
      if (set_id) {
        app_state.setSelectedSet(set_id);
        const set = problem_set_store.problem_sets.get(set_id);
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
    <b-row>
      <b-col cols="9">
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
      </b-col>
      <b-col cols="3">
        <problem-set-sidebar />
      </b-col>
    </b-row>
  </b-container>
</template>

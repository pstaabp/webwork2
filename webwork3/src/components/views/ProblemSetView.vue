<template>
  <b-container>
    <b-tabs content-class="mt-3">
      <b-tab title="Set Details" active>
        <set-info
          :problem_sets="problem_sets_array"
          :selected_problem_set="problem_set"
        />
      </b-tab>
      <b-tab title="Gateway Info" :disabled="!is_gateway">
        <gateway-info :selected_problem_set="problem_set" />
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

<script lang="ts">
import { Vue, Component, Watch, Prop } from "vue-property-decorator";
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
    SetHeaders
  }
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

  private updateSet(_set: ProblemSet) {
    problem_sets_store.updateProblemSet(_set);
  }

  private created() {
    // watch for changes in the selected set from the menu bar.
    this.$store.subscribe((mutation, state) => {
      if (
        app_state.current_view === "set-view" &&
        mutation.type === "app_state/setSelectedSet"
      ) {
        this.$router
          .push({ name: "setview", params: { set_id: app_state.selected_set } })
          .catch(err => {
            // if the route is the same, don't throw the error
            if (err.name !== "NavigationDuplicated") {
              console.error(err); // eslint-disable-line no-console
            }
          });
        const _set = problem_sets_store.problem_sets.get(
          app_state.selected_set
        );
        if (_set) {
          this.problem_set = _set;
        }
      }
    });
  }

  @Watch("$route")
  private routeChanged(to: any, from: any) {
    if (to.name === "setview") {
      const set_id =
        (to.params && to.params.set_id) || (to.query && to.query.set_id);
      if (set_id) {
        app_state.setSelectedSet(set_id);
      }
    }
  }
} // class SetDetails
</script>

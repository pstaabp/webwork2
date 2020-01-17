<template>
    <b-container>
    <b-tabs content-class="mt-3">
      <b-tab title="Set Details" active>
        <set-info :problem_sets="problem_sets_array" :problem_set="problem_set"/></b-tab>
      <b-tab title="Problems"><problem-list-view :problem_set="problem_set"/></b-tab>
      <b-tab title="Assign Users">
        <assign-users :problem_set="problem_set"/></b-tab>
      <b-tab title="Set Headers"><set-headers :problem_set="problem_set"/></b-tab>
    </b-tabs>
  </b-container>
</template>



<script lang="ts">
import { Vue, Component, Watch, Prop } from 'vue-property-decorator';
import {mixins} from 'vue-class-component';


import SetInfo from './ProblemSetViewComponents/SetInfo.vue';
import ProblemListView from './ProblemSetViewComponents/ProblemListView.vue';
import AssignUsers from './ProblemSetViewComponents/AssignUsers.vue';
import SetHeaders from './ProblemSetViewComponents/SetHeaders.vue';

import {ProblemSet} from '@/store/models';

import ProblemSetMixin from '@/mixins/problem_set_mixin';

// set up the store
import problem_sets_store from '@/store/modules/problem_sets';
import app_state from '@/store/modules/app_state';

@Component({
  name: 'ProblemSetView',
  components: {
    SetInfo,
    ProblemListView,
    AssignUsers,
    SetHeaders,
  },
})
export default class ProblemSetView extends mixins(ProblemSetMixin) {

  private problem_set: ProblemSet = this.emptySet();

  private get problem_sets_array() {
    return Array.from(problem_sets_store.problem_sets.values());
  }

  private get problem_sets_names() {
    return Array.from(problem_sets_store.problem_sets.keys());
  }

  public created() {
    // watch for changes in the selected set from the menu bar.
    this.$store.subscribe((mutation, state) => {
      if (mutation.type === 'app_state/setSelectedSet') {
        if (problem_sets_store.problem_sets.get(mutation.payload)) {
          this.problem_set = problem_sets_store.problem_sets.get(mutation.payload);
        }
     }
    });
    const _set_id = app_state.selected_set;
    if (_set_id && problem_sets_store.problem_sets.get(_set_id)) {
      this.problem_set = problem_sets_store.problem_sets.get(app_state.selected_set);
    }
  }

  // public mounted() {
  //   if (this.$route.query && this.$route.query.set_id) {
  //     this.selected_set_id = this.$route.query.set_id as string;
  //   }
  // }

} // class SetDetails
</script>

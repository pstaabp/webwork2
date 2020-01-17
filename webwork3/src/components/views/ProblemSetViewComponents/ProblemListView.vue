<template>
  <div class="scrollable">
    <draggable handle=".drag-handle" :move="reordered">
      <ProblemView v-for="problem in problems" :key="problem.problem_id"
          :problem="problem" type="set"/>
    </draggable>
  </div>
</template>



<script lang="ts">
import { Vue, Component, Watch, Prop } from 'vue-property-decorator';

import ProblemView from '@/components/common_components/ProblemView.vue';
import Draggable from 'vuedraggable';

import {ProblemSet} from '@/store/models';

// set up the store
import problem_sets_store from '@/store/modules/problem_sets';


@Component({
  name: 'ProblemListView',
  components: {
    ProblemView, Draggable,
  },
})
export default class ProblemListView extends Vue {

  @Prop()
  private problem_set!: ProblemSet;

  get problems() {
    return this.problem_set === undefined ? [] : this.problem_set.problems;
  }

  private reordered() {
    // tslint:disable-next-line
    console.log("reordering");
  }

}
</script>

<template>
  <div class="scrollable">
    <draggable handle=".drag-handle" @sort="reordered">
      <ProblemView v-for="problem in problems" :key="problem.problem_id"
          :problem="problem" type="set"/>
    </draggable>
  </div>
</template>



<script lang="ts">
import { Vue, Component, Watch, Prop } from 'vue-property-decorator';

import ProblemView from '@/components/common_components/ProblemView.vue';
import Draggable from 'vuedraggable';

// set up the store
import { getModule } from 'vuex-module-decorators';
import WeBWorKStore from '@/store';
const store = getModule(WeBWorKStore);


@Component({
  name: 'ProblemListView',
  components: {
    ProblemView, Draggable,
  },
})
export default class ProblemListView extends Vue {

  @Prop()
  private selected_set_id!: string;

  get problems() {
    const sets = store.problem_sets;
    if (sets === undefined || sets.size() === 0 || this.selected_set_id === '') {
      return [];
    }

    const problemSet = sets.get(this.selected_set_id);
    return problemSet === undefined ? [] : problemSet.get('problems').models();
  }

  private reordered() {
    //
  }

}
</script>

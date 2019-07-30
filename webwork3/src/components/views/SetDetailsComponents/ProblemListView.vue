<template>
  <div class="scrollable">
    <draggable handle=".drag-handle" @sort="reordered">
      <ProblemView v-for="problem in getProblems" :key="problem.problem_id"
          :problem="problem" type="set"/>
    </draggable>
  </div>
</template>



<script>
import {mapState} from 'vuex';
import ProblemView from '@/components/common_components/ProblemView.vue';
import draggable from 'vuedraggable';

export default {
  name: 'ProblemListView',
  props: {
    selected_set_id: String,
  },
  components: {
    ProblemView, draggable,
  },
  data() {
    return {

    };
  },
  computed: {
    ...mapState(['problem_sets']),
    getProblems() {
      const sets = this.problem_sets;
      if (sets === undefined || sets.length === 0) {
        return [];
      }

      const problemSet = sets.find( (set) => set.set_id === this.selected_set_id);
      return problemSet === undefined ? [] : problemSet.problems;
    },
  }, // computed
  methods: {
    reordered() {
      // reorder the problems
    },
  },
};
</script>

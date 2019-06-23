<template>
  <div class="scrollable">
    <draggable handle=".drag-handle" @sort="reordered">
      <ProblemView v-for="problem in getProblems" :key="problem.problem_id"
          :problem="problem" type="set"/>
    </draggable>
  </div>
</template>



<script>
import ProblemView from '@/components/common_components/ProblemView.vue'
import draggable from 'vuedraggable'

export default {
  name: 'ProblemListView',
  props: {
    selected_set_id: String
  },
  components: {
    ProblemView, draggable
  },
  data: function() {
    return {

    }
  },
  computed: {
    getProblems() {
      const sets = this.$store.state.problem_sets
      if (sets === undefined || sets.length == 0){ return []}

      const problem_set = sets.find(_set => _set.set_id == this.selected_set_id)
      return problem_set === undefined ? [] : problem_set.problems;
    }
  }, // computed
  methods: {
    reordered(){
      // eslint-disable-next-line
      console.log("in update")
    }
  }
}
</script>

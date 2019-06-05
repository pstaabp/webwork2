<template>
  <draggable handle=".drag-handle" @sort="reordered">
    <ProblemView v-for="problem in getProblems" :key="problem.problem_id"
        :problem="problem" type="set"/>
  </draggable>
</template>



<script>
import ProblemView from '../view_components/ProblemView.vue'
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
      return (sets === undefined || sets.length == 0) ? [] :
          (sets.find(_set => _set.set_id == this.selected_set_id).problems || [])
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

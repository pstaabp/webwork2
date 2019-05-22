<template>
  <div>
    <ProblemView v-for="problem in selected_set.problems" :key="problem.problem_id"
        :problem="problem" type="set"/>
  </div>
</template>



<script>
import ProblemView from './ProblemView.vue'

export default {
  name: 'ProblemListView',
  props: ['selected_set'],
  components: {
    ProblemView
  },
  data: function() {
    return {

    }
  }
}
</script>

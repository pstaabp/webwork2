<template>
  <div v-if="problem_sets" class="list-group">
    <button class="list-group-item list-group-item-info" @click="goto(set.set_id)"
        v-for="set in problem_sets.models" :key="set.set_id">{{set.set_id}}</button>
  </div>
</template>

<script>
import ProblemSetList from '../../models/ProblemSetList.js'
export default {
  name: 'ProblemSetsSidebar',
  props: {
    problem_sets: ProblemSetList
  },
  methods: {
    goto: function(evt){
      // eslint-disable-next-line
      console.log(evt);
    }
  },
}
</script>

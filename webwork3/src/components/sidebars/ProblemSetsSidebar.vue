<template>
  <div v-if="problem_sets" class="list-group">
    <button class="list-group-item list-group-item-info" @click="goto(set.set_id)"
        v-for="set in problem_sets.models" :key="set.set_id">{{set.set_id}}</button>
  </div>
</template>

<script>

export default {
  name: 'ProblemSetsSidebar',
  methods: {
    goto: function(evt){
      // eslint-disable-next-line
      console.log(evt);
    }
  },
  computed: {
    getProblemSets(){
      return this.$store.state.problem_sets;
    }
  }
}
</script>

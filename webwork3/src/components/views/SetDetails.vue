<template>
  <b-tabs content-class="mt-3">
    <b-tab title="Set Details" active>
      <set-info :problem_sets="getProblemSets" :selected_set_id="selected_set_id"/></b-tab>
    <b-tab title="Problems"><problem-list-view :selected_set_id="selected_set_id"/></b-tab>
    <b-tab title="Assign Users Overrides">
      <assign-users :selected_set_id="selected_set_id"/></b-tab>
    <b-tab title="Set Headers"><set-headers :selected_set_id="selected_set_id"/></b-tab>
    <template slot="tabs">
      <b-nav-item href="#" @click="() => {}" id="custom-tab">
        <b-select size="sm" v-model="selected_set_id" @change="check">
          <option :value="null" selected>Select a Set</option>
          <option v-for="set in getProblemSets" :value="set.set_id" :key="set.set_id">{{set.set_id}}</option>
        </b-select>
      </b-nav-item>
    </template>
  </b-tabs>
</template>



<script>
import SetInfo from './SetDetailsComponents/SetInfo.vue'
import ProblemListView from './SetDetailsComponents/ProblemListView.vue'
import AssignUsers from './SetDetailsComponents/AssignUsers.vue'
import SetHeaders from './SetDetailsComponents/SetHeaders.vue'

import common from '../../common.js'

export default {
  name: 'SetDetails',
  data: function () {
      return {
        selected_set_id: "set1"
      }
  },
  components: {
    SetInfo,
    ProblemListView,
    AssignUsers,
    SetHeaders
  },
  computed: {
    getProblemSets: function(){
      return this.$store.state.problem_sets
    },
    getSelectedSet () {
      return (_sets && _sets.length>0) ? _sets.find(_set => _set.set_id == this.selected_set_id)
          : common.new_problem_set;
    }
  },
  methods: {
    check: function() {
      // eslint-disable-next-line
      console.log(this.selected_set_id)
      return {};
    }
  }
}
</script>

<style scoped>
#custom-tab a {
   padding-top: 4px;
   padding-bottom: 4px
}
 </style>  .

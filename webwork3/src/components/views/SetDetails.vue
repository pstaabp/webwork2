<template>
    <b-container>
    <b-tabs content-class="mt-3">
      <b-tab title="Set Details" active>
        <set-info :problem_sets="problem_sets" :problem_set="problem_set"/></b-tab>
      <b-tab title="Problems"><problem-list-view :selected_set_id="selected_set_id"/></b-tab>
      <b-tab title="Assign Users Overrides">
        <assign-users :selected_set_id="selected_set_id"/></b-tab>
      <b-tab title="Set Headers"><set-headers :selected_set_id="selected_set_id"/></b-tab>
      <template slot="tabs">
        <b-nav-item href="#" @click="() => {}" id="custom-tab">
          <b-select size="sm" v-model="selected_set_id" @change="check">
            <option :value="null" selected>Select a Set</option>
            <option v-for="set in problem_sets" :value="set.set_id" :key="set.set_id">{{set.set_id}}</option>
          </b-select>
        </b-nav-item>
      </template>
    </b-tabs>
  </b-container>
</template>



<script>
import {mapState} from 'vuex'

import SetInfo from './SetDetailsComponents/SetInfo.vue'
import ProblemListView from './SetDetailsComponents/ProblemListView.vue'
import AssignUsers from './SetDetailsComponents/AssignUsers.vue'
import SetHeaders from './SetDetailsComponents/SetHeaders.vue'

import common from '../../common.js'

export default {
  name: 'SetDetails',
  data: function () {
      return {
        selected_set_id: "set1",
        problem_set: common.new_problem_set,
        data_loading : true
      }
  },
  components: {
    SetInfo,
    ProblemListView,
    AssignUsers,
    SetHeaders
  },
  computed: {
    ...mapState(['problem_sets'])
  },
  watch: {
    selected_set_id(){
      this.problem_set = this.problem_sets.find(_set => _set.set_id == this.selected_set_id);
    },
    problem_sets(){
      // eslint-disable-next-line
      console.log("problem_sets changed")
      this.problem_set = this.problem_sets.find(_set => _set.set_id == this.selected_set_id);
    },
    problem_set: {
      handler: function(){

        if(this.data_loading){
          this.data_loading = false;
          return;
        }
        if(this.validReducedScoring && this.validDueDate && this.validAnswerDate){

          Object.assign(this.problem_set,this.msgUpdateProblemSet(this.set_params,this.problem_set))
          this.$store.dispatch("updateProblemSet",this.problem_set)
          this.set_params = Object.assign({},this.problem_set);
        }
      },
      deep: true
    },
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

<template>
  <b-tabs content-class="mt-3">
    <b-tab title="Set Details" active><SetInfo :selected_set="getSelectedSet"/></b-tab>
    <b-tab title="Problems"><ProblemListView :selected_set="getSelectedSet"/></b-tab>
    <b-tab title="Assign Users">USERS</b-tab>
    <b-tab title="Student Overrides"><Overrides  :selected_set="getSelectedSet"/></b-tab>
    <b-tab title="Set Headers"><SetHeaders :selected_set="getSelectedSet"/></b-tab>
    <template slot="tabs">
      <b-nav-item href="#" @click="() => {}" class="pb-0">
        <b-select size="sm" v-model="selected_set" @change="check">
          <option :value="null" selected>Select a Set</option>
          <option v-for="set in problem_sets.models" :value="set.set_id" :key="set.set_id">{{set.set_id}}</option>
        </b-select>
      </b-nav-item>
    </template>
  </b-tabs>
</template>



<script>
import SetInfo from './view_components/SetInfo.vue'
import ProblemListView from './view_components/ProblemListView.vue'
import Overrides from './view_components/Overrides.vue'
import SetHeaders from './view_components/SetHeaders.vue'

// models
//import ProblemSetList from '../../models/ProblemSetList.js'

export default {
  name: 'SetDetails',
  data: function () {
      return {
        selected_set: "set1"
      }
  },
  props: {
    //problem_sets: ProblemSetList
  },
  components: {
    SetInfo,
    ProblemListView,
    Overrides,
    SetHeaders
  },
  computed: {
    getSelectedSet: function(){
      return this.problem_sets.length == 0? "" : this.problem_sets.where(_set => _set.set_id == this.selected_set)[0];
    }
  },
  methods: {
    check: function() {
      // eslint-disable-next-line
      console.log(this.selected_set)
      return {};
    }
  },
}
</script>

<template>
  <b-tabs content-class="mt-3">
    <b-tab title="By Subj." active>
      <library-subjects :problem_sets="problem_sets" :selected_set_id="selected_set_id"/></b-tab>
    <b-tab title="By Directory"><h3>Browse by Directory</h3></b-tab>
    <b-tab title="Textbooks"><h3>Browse problems in textbooks</h3></b-tab>
    <b-tab title="Local Prob."><h3>Browse local problems</h3></b-tab>
    <b-tab title="Set Defn. files"><h3>Browse Set Definition Files</h3></b-tab>
    <b-tab title="Search"><h3>Search the Library</h3></b-tab>
    <b-tab title="Pending"><h3>Browse pending problems</h3></b-tab>
  </b-tabs>
</template>



<script>
// tab components
import LibrarySubjects from './view_components/LibrarySubjects.vue'
// models
import ProblemSetList from '../../models/ProblemSetList.js'

export default {
  name: 'SetDetails',
  props: {
    problem_sets: ProblemSetList,
    selected_set_id: String
  },
  components: {
    LibrarySubjects
  },
  computed: {
    getSelectedSet: function(){
      return this.problem_sets.length == 0? "" : this.problem_sets.find(_set => _set.set_id == this.selected_set_id);
    }
  }
}
</script>

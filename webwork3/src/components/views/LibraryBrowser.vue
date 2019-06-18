<template>
  <b-tabs content-class="mt-3">
    <b-tab title="By Subj." active>
      <library-subjects :selected_set_id="selected_set_id"/>
    </b-tab>
    <b-tab title="By Directory">
      <library-directory :select_set_id="selected_set_id" />
    </b-tab>
    <b-tab title="Textbooks"><h3>Browse problems in textbooks</h3></b-tab>
    <b-tab title="Local Prob."><h3>Browse local problems</h3></b-tab>
    <b-tab title="Set Defn. files"><h3>Browse Set Definition Files</h3></b-tab>
    <b-tab title="Search"><h3>Search the Library</h3></b-tab>
    <b-tab title="Pending"><h3>Browse pending problems</h3></b-tab>
  </b-tabs>
</template>



<script>
// tab components
import LibrarySubjects from './LibraryComponents/LibrarySubjects.vue'
import LibraryDirectory from './LibraryComponents/LibraryDirectory.vue'

export default {
  name: 'SetDetails',
  props: {
    selected_set_id: String
  },
  components: {
    LibrarySubjects, LibraryDirectory
  },
  computed: {
    getSelectedSet: function(){
      return this.problem_sets.length == 0? "" : this.problem_sets.find(_set => _set.set_id == this.selected_set_id);
    },
  }
}
</script>

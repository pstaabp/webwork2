<template>
  <b-tabs content-class="mt-3">
    <b-tab title="By Subj." active>
      <library-tab tab_name="subjects" :problem_sets="problem_sets"/>
    </b-tab>
    <b-tab title="By Directory">
      <library-tab tab_name="directory" :problem_sets="problem_sets"/>
    </b-tab>
    <b-tab title="Textbooks">
      <library-tab tab_name="textbooks" :problem_sets="problem_sets" />
    </b-tab>
    <b-tab title="Local Prob.">
      <library-tab tab_name="local" :problem_sets="problem_sets" />
    </b-tab>
    <b-tab title="Set Defn. files"><h3>Browse Set Definition Files</h3></b-tab>
    <b-tab title="Search"><h3>Search the Library</h3></b-tab>
    <b-tab title="Pending"><h3>Browse pending problems</h3></b-tab>
  </b-tabs>
</template>



<script>
import {mapState} from 'vuex';

import LibraryTab from './LibraryComponents/LibraryTab';

export default {
  name: 'SetDetails',
  components: {
    LibraryTab,
  },
  computed: {
    ...mapState(['problem_sets']),
    getSelectedSet() {
      return this.problem_sets.length === 0 ? '' :
        this.problem_sets.find( (_set) => _set.set_id === this.selected_set_id);
    },
  },
};
</script>

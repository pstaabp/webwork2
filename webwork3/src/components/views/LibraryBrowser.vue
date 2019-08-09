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



<script lang="ts">
import { Vue, Component, Prop} from 'vue-property-decorator';

import LibraryTab from './LibraryComponents/LibraryTab.vue';

// set up the store
import { getModule } from 'vuex-module-decorators';
import WeBWorKStore from '@/store';
const store = getModule(WeBWorKStore);


@Component({
  name: 'SetDetails',
  components: {
    LibraryTab,
  },
})
export default class LibraryBrowser extends Vue {
  @Prop()
  private selected_set_id!: string;

private getSelectedSet() {
    return store.problem_sets.size() === 0 ? '' : store.problem_sets.get(this.selected_set_id);
  }
}
</script>

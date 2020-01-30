<template>
  <b-tabs content-class="mt-3">
    <b-tab title="Scoring Export">
      <scoring-export />
    </b-tab>
    <b-tab title="Progress For Selected Set"><p>I'm the second tab</p></b-tab>
    <b-tab title="Progress For Selected User"><p>I'm a disabled tab!</p></b-tab>
  </b-tabs>
</template>

<script type="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';

import ScoringExport from './StatisticsComponents/ScoringExport.vue';
// import problem_set_store from '@/store/modules/problem_sets';
// import {ProblemSet, ProblemSetList} from '@/store/models';

@Component({
  name: 'Statistics',
  components: {
    ScoringExport,
  },
})
export default class Statistics extends Vue {

}
</script>

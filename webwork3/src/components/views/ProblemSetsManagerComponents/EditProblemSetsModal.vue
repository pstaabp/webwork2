<template>
  <b-modal id="edit-problem-sets-modal" size="lg" ref="sfmodal" title="Edit Problem Sets"
      ok-title="Save and Close" @ok="save">
    <b-container fluid>
      <b-row><b-col cols="5">Set Name(s)</b-col><b-col cols="5">{{getSetNames}}</b-col></b-row>
      <b-form-group label-cols="5" label="Visible">
        <b-checkbox v-model="problem_set.visible" />
      </b-form-group>
      <b-form-group label-cols="5" label="Reduced Scoring">
        <b-checkbox v-model="problem_set.enable_reduced_scoring" />
      </b-form-group>
      <b-form-group label-cols="5" label="Open Date">
        <b-form-input v-model="open_date" type="datetime-local"/>
      </b-form-group>
      <b-form-group label-cols="5" label="Reduced Scoring Date"
          invalid-feedback="This date must be after the open date.">
        <b-form-input v-model="reduced_scoring_date" type="datetime-local" :state="validReducedScoring"/>
      </b-form-group>
      <b-form-group label-cols="5" label="Due Date"
        invalid-feedback="This date must be after the reduced scoring date.">
        <b-form-input v-model="due_date" type="datetime-local" :state="validDueDate"/>
      </b-form-group>
      <b-form-group label-cols="5" label="Answer Date"
        invalid-feedback="This date must be after the due date.">
        <b-form-input v-model="answer_date" type="datetime-local" :state="validAnswerDate"/>
      </b-form-group>

    </b-container>
  </b-modal>
</template>

<script lang="ts">
import { Vue, Component, Watch, Prop } from 'vue-property-decorator';
import {mixins} from 'vue-class-component';

import ProblemSetMixin from '@/mixins/problem_set_mixin';

import {ProblemSet} from '@/store/models';

@Component({
  name: 'EditProblemSetsModal',
  //  mixins: [ProblemSetMixin ],
})
export default class SetInfo extends mixins(ProblemSetMixin) {
  private problem_set: ProblemSet = this.emptySet();
  @Prop() private selected_sets: ProblemSet[] = [];

  @Watch('selected_sets')
  private selectedSetsChanged() {
    // tslint:disable-next-line
    console.log('in EditProblemSetsModal');
    const _sets = this.selected_sets || [];
    this.problem_set.open_date = Math.min(..._sets.map( (_set) => _set.open_date));
    this.problem_set.reduced_scoring_date = Math.min(..._sets.map( (_set) => _set.reduced_scoring_date));
    this.problem_set.due_date = Math.min(..._sets.map( (_set) => _set.due_date));
    this.problem_set.answer_date = Math.min(..._sets.map( (_set) => _set.answer_date));
  }

  private getSetNames() {
    return this.selected_sets.map( (_set) => _set.set_id).join(', ');
  }

  private save() {
    this.selected_sets.forEach( (_set) => {
      const { enable_reduced_scoring, visible, open_date, reduced_scoring_date,
          due_date, answer_date } = this.problem_set;
      Object.assign(_set, { enable_reduced_scoring, visible, open_date,
                            reduced_scoring_date, due_date, answer_date });
      this.$store.dispatch('updateProblemSet', _set);
    });

    this.$bvModal.hide('edit-problem-sets-modal');
  }
}
</script>

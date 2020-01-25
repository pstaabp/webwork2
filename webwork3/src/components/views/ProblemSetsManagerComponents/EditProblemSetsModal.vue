<template>
  <b-modal id="edit-problem-sets-modal" size="lg" ref="sfmodal" title="Edit Problem Sets"
      ok-title="Save and Close" @ok="save">
    <b-container fluid>
      <b-row><b-col cols="5">Set Name(s)</b-col><b-col cols="5">{{set_names}}</b-col></b-row>
      <b-form-group label-cols="5" label="Visible">
        <b-checkbox v-model="problem_set.visible" />
      </b-form-group>
      <b-form-group label-cols="5" label="Reduced Scoring">
        <b-checkbox v-model="problem_set.enable_reduced_scoring" />
      </b-form-group>
      <b-form-group label-cols="5" label="Open Date">
        <b-form-input :value="problem_set.open_date | formatDateTime" type="datetime-local"
          @blur="setOpenDate(problem_set,$event.target.value)"/>
      </b-form-group>
      <b-form-group label-cols="5" label="Reduced Scoring Date"
          invalid-feedback="This date must be after the open date.">
        <b-form-input :value="problem_set.reduced_scoring_date | formatDateTime"
            type="datetime-local" :state="validReducedScoring"
            @blur="setReducedScoringDate(problem_set,$event.target.value)"/>
      </b-form-group>
      <b-form-group label-cols="5" label="Due Date"
        invalid-feedback="This date must be after the reduced scoring date.">
        <b-form-input :value="problem_set.due_date | formatDateTime"
          type="datetime-local" :state="validDueDate"
          @blur="setDueDate(problem_set,$event.target.value)"/>
      </b-form-group>
      <b-form-group label-cols="5" label="Answer Date"
        invalid-feedback="This date must be after the due date.">
        <b-form-input :value="problem_set.answer_date | formatDateTime"
          type="datetime-local" :state="validAnswerDate"
          @blur="setAnswerDate(problem_set,$event.target.value)"/>
      </b-form-group>

    </b-container>
  </b-modal>
</template>

<script lang="ts">
import { Vue, Component, Watch, Prop } from 'vue-property-decorator';
import {mixins} from 'vue-class-component';

import ProblemSetMixin from '@/mixins/problem_set_mixin';

import Common from '@/common';
import {ProblemSet} from '@/store/models';

import problem_sets_store from '@/store/modules/problem_sets';

@Component({
  name: 'EditProblemSetsModal',
})
export default class SetInfo extends mixins(ProblemSetMixin) {
  private problem_set: ProblemSet = this.emptySet();
  @Prop() private selected_sets!: ProblemSet[];

  @Watch('selected_sets')
  private selectedSetsChanged() {
    const _sets = this.selected_sets || [];
    this.problem_set.open_date = Math.min(..._sets.map( (_set) => _set.open_date));
    this.problem_set.reduced_scoring_date = Math.min(..._sets.map( (_set) => _set.reduced_scoring_date));
    this.problem_set.due_date = Math.min(..._sets.map( (_set) => _set.due_date));
    this.problem_set.answer_date = Math.min(..._sets.map( (_set) => _set.answer_date));

    // tslint:disable-next-line
    console.log(this.problem_set.open_date);
  }

  private get set_names() {
    return this.selected_sets.map( (_set) => _set.set_id).join(', ');
  }

  private save() {
    this.selected_sets.forEach( (_set) => {
      // see if there is a better way to do this:

      // _set.enable_reduced_scoring = this.problem_set.enable_reduced_scoring;
      // _set.visible = this.problem_set.visible;
      // _set.open_date = this.problem_set.open_date;
      // _set.reduced_scoring_date = this.problem_set.reduced_scoring_date;
      // _set.due_date = this.problem_set.due_date;
      // _set.answer_date = this.problem_set.answer_date;
       const { enable_reduced_scoring, visible, open_date, reduced_scoring_date,
           due_date, answer_date } = this.problem_set;
      Object.assign(_set, { enable_reduced_scoring, visible, open_date,
                             reduced_scoring_date, due_date, answer_date });
      problem_sets_store.updateProblemSet(_set);
    });

    this.$bvModal.hide('edit-problem-sets-modal');
    this.$emit('update-set')
  }



  get validReducedScoring() {
    return Common.validReducedScoring(this.problem_set);
  }

  get validDueDate() {
    return Common.validDueDate(this.problem_set);
  }

  get validAnswerDate() {
    return Common.validAnswerDate(this.problem_set);
  }
}
</script>

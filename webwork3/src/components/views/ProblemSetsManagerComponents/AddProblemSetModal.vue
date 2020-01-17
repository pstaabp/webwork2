<template>
  <b-modal id="add-problem-set-modal" ref="add-prob-set-modal" title="Add A Problem Set"
    ok-title="Add Problem Set and Close" @ok="addProblemSet">
    <b-container>
      <b-form-group label-cols="4" label="Problem Set Name" :invalid-feedback="feedback()">
        <b-form-input ref="set_id" v-model="problem_set.set_id" :state="valid_name && set_not_defined"/>
      </b-form-group>
      <b-form-group label-cols="4" label="Visible">
        <b-checkbox v-model="problem_set.visible" />
      </b-form-group>
      <b-form-group label-cols="4" label="Reduced Scoring">
        <b-checkbox v-model="problem_set.enable_reduced_scoring" />
      </b-form-group>
    </b-container>
  </b-modal>
</template>


<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import {mixins} from 'vue-class-component';
import * as moment from 'moment';


import {ProblemSet} from '@/store/models';
import ProblemSetMixin from '@/mixins/problem_set_mixin';

// set up the store
import problem_sets_store from '@/store/modules/problem_sets';
import settings_store from '@/store/modules/settings';


@Component({
  name: 'AddProblemSetModal',
  // mixins: [ProblemSetsMixin],
})
export default class AddProblemSetModal extends mixins(ProblemSetMixin) {
  private problem_set: ProblemSet = this.emptySet();
  private valid_name = true;
  private set_not_defined = true;

  @Prop()
  private problem_sets!: Map<string, ProblemSet>;

  private validSetName() {
    this.valid_name = /^[A-Za-z_][\w_]*$/.test(this.problem_set.set_id);
    return this.valid_name;
  }

  private setNotDefined(): boolean {
    return this.problem_sets.get(this.problem_set.set_id) === undefined;
  }

  private feedback(): string {
    if (!this.valid_name) {
      return 'The name is not a valid name.';
    } else if (! this.set_not_defined) {
      return 'This name has already been used.';
    }
    return '';
  }

  private addProblemSet(bvModalEvt: BvEvent) {
    bvModalEvt.preventDefault();
    if (!this.validSetName() || ! this.setNotDefined()) {
      return;
    }

    // update all of the dates.
    const timeAssignDueString =
      settings_store.settings.find( (_setting) => _setting.var === 'pg{timeAssignDue}').value;
    const timeAssignDue = moment.default(timeAssignDueString, 'hh:mma');
    const openDate  = moment.default().add(7, 'days').hour(time_assign_due.hour()).minute(time_assign_due.minute());
    const dueDate = moment.default(open_date).add(10, 'days');
    const reducedScoringDate = moment.default(open_date).add(7, 'days');
    const answerDate = moment.default(due_date).add(7, 'days');

    this.problem_set.open_date = openDate.unix();
    this.problem_set.due_date = dueDate.unix();
    this.problem_set.reduced_scoring_date = reducedScoringDate.unix();
    this.problem_set.answer_date = answerDate.unix();


    // add to the store state:
    // problem_sets_store.newProblemSet(this.problem_set);
    this.problem_set = this.emptySet();

    // Hide the modal manually
    this.$nextTick(() => {
      this.$bvModal.hide('bv-modal-example');
    });
  }
}

</script>

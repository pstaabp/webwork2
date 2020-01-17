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
    const time_assign_due_setting = settings_store.settings.find( (_setting) => _setting.var === 'pg{timeAssignDue}');
    const time_assign_due_string = time_assign_due_setting ? time_assign_due_setting.value : '';
    const time_assign_due = moment.default(time_assign_due_string, 'hh:mma');
    const open_date  = moment.default().add(7, 'days').hour(time_assign_due.hour()).minute(time_assign_due.minute());
    const due_date = moment.default(open_date).add(10, 'days');
    const reduced_scoring_date = moment.default(open_date).add(7, 'days');
    const answer_date = moment.default(due_date).add(7, 'days');

    this.problem_set.open_date = open_date.unix();
    this.problem_set.due_date = due_date.unix();
    this.problem_set.reduced_scoring_date = reduced_scoring_date.unix();
    this.problem_set.answer_date = answer_date.unix();


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

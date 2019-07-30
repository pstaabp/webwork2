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


<script>
import ProblemSet from '@/models/ProblemSet';
import moment from 'moment';

export default {
  data() {
    return {
      problem_set: new ProblemSet(),
      valid_name: true,
      set_not_defined: true,
    };
  },
  props: {
    problem_sets: Array,
  },
  methods: {
    validSetName() {
      this.valid_name = /^[A-Za-z_][\w_]*$/.test(this.problem_set.set_id);
      return this.valid_name;
    },
    setNotDefined() {
      this.set_not_defined =  this.problem_sets.find( (_set) => _set.set_id === this.problem_set.set_id) === undefined;
      return this.set_not_defined;
    },
    feedback() {
      if (!this.valid_name) {
        return 'The name is not a valid name.';
      } else if (! this.set_not_defined) {
        return 'This name has already been used.';
      }
      return '';
    },
    addProblemSet() {
      modal_evt.preventDefault();
      if (!this.validSetName() || ! this.setNotDefined()) {
        return;
      }

      // update all of the dates.
      const timeAssignDueString =
        this.$store.state.settings.find( (_setting) => _setting.var === 'pg{timeAssignDue}').value;
      const timeAssignDue = moment(timeAssignDueString, 'hh:mma');
      const openDate  = moment().add(7, 'days').hour(time_assign_due.hour()).minute(time_assign_due.minute());
      const dueDate = moment(open_date).add(10, 'days');
      const reducedScoringDate = moment(open_date).add(7, 'days');
      const answerDate = moment(due_date).add(7, 'days');

      this.problem_set.open_date = openDate.unix();
      this.problem_set.due_date = dueDate.unix();
      this.problem_set.reduced_scoring_date = reducedScoringDate.unix();
      this.problem_set.answer_date = answerDate.unix();


      // add to the store state:
      this.$store.dispatch('newProblemSet', this.problem_set);
      this.problem_set = common.new_problem_set;

      // Hide the modal manually
      this.$nextTick(() => {
        this.$refs['add-prob-set-modal'].hide();
      });
    },
  },
};

</script>

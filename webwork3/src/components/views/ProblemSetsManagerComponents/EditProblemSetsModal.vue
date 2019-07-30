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
        <b-form-input v-model="displayOpenDate" type="datetime-local"/>
      </b-form-group>
      <b-form-group label-cols="5" label="Reduced Scoring Date"
          invalid-feedback="This date must be after the open date.">
        <b-form-input v-model="displayReducedScoringDate" type="datetime-local" :state="validReducedScoring"/>
      </b-form-group>
      <b-form-group label-cols="5" label="Due Date"
        invalid-feedback="This date must be after the reduced scoring date.">
        <b-form-input v-model="displayDueDate" type="datetime-local" :state="validDueDate"/>
      </b-form-group>
      <b-form-group label-cols="5" label="Answer Date"
        invalid-feedback="This date must be after the due date.">
        <b-form-input v-model="displayAnswerDate" type="datetime-local" :state="validAnswerDate"/>
      </b-form-group>

    </b-container>
  </b-modal>
</template>



<script>
import ProblemSet from '@/models/ProblemSet';

import ProblemSetMixin from '@/mixins/problem_set_mixin';

export default {
  name: 'EditProblemSetsModal',
  data() {
    return {
      problem_set: new ProblemSet(),
    };
  },
  mixins: [ProblemSetMixin],
  props: {
    selected_sets: Array,
  },
  watch: {
    selected_sets() {
      this.problem_set.open_date
          = Math.min(...this.selected_sets.map( (_set) => _set.open_date));
      this.problem_set.reduced_scoring_date
          = Math.min(...this.selected_sets.map( (_set) => _set.reduced_scoring_date));
      this.problem_set.due_date
          = Math.min(...this.selected_sets.map( (_set) => _set.due_date));
      this.problem_set.answer_date
          = Math.min(...this.selected_sets.map( (_set) => _set.answer_date));
    },
  },
  computed: {
    getSetNames() {
      return this.selected_sets.map( (_set) => _set.set_id).join(', ');
    },
  }, // computed
  methods: {
    save() {
      this.selected_sets.forEach( (_set) => {
        const { enable_reduced_scoring, visible, open_date, reduced_scoring_date,
            due_date, answer_date } = this.problem_set;
        Object.assign(_set, { enable_reduced_scoring, visible, open_date,
                              reduced_scoring_date, due_date, answer_date });
        this.$store.dispatch('updateProblemSet', _set);
      });

      this.$bvModal.hide('edit-problem-sets-modal');
    },
  },
};
</script>

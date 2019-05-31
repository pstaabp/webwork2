<template>
  <b-modal id="edit-problem-sets-modal" size="lg" ref="sfmodal" title="Edit Problem Sets"
      ok-title="Save and Close" @ok="save">
    <b-container fluid>
      <b-row><b-col cols="5">Set Name(s)</b-col><b-col cols="5">{{getSetNames}}</b-col></b-row>
      <b-form-group label-cols="5" label="Visible">
        <b-checkbox v-model="visible" />
      </b-form-group>
      <b-form-group label-cols="5" label="Reduced Scoring">
        <b-checkbox v-model="enable_reduced_scoring" />
      </b-form-group>
      <b-form-group label-cols="5" label="Open Date">
        <b-form-input v-model="compOpenDate" type="datetime-local"/>
      </b-form-group>
      <b-form-group label-cols="5" label="Reduced Scoring Date"
          invalid-feedback="This date must be after the open date.">
        <b-form-input v-model="compReducedScoringDate" type="datetime-local" :state="validReducedScoring"/>
      </b-form-group>
      <b-form-group label-cols="5" label="Due Date"
        invalid-feedback="This date must be after the reduced scoring date.">
        <b-form-input v-model="compDueDate" type="datetime-local" :state="validDueDate"/>
      </b-form-group>
      <b-form-group label-cols="5" label="Answer Date"
        invalid-feedback="This date must be after the due date.">
        <b-form-input v-model="compAnswerDate" type="datetime-local" :state="validAnswerDate"/>
      </b-form-group>

    </b-container>
  </b-modal>
</template>



<script>
import common from '../../../common.js'
import moment from 'moment'

export default {
  name: 'EditProblemSetsModal',
  data: function() {
    return {
      visible: false,
      enable_reduced_scoring: false,
      open_date: 0,
      reduced_scoring_date: 0,
      due_date: 0,
      answer_date: 0
    }
  },
  props: {
    selected_sets: Array
  },
  watch: {
    selected_sets() {
      this.open_date = Math.min(...this.selected_sets.map(_set => _set.open_date))
      this.reduced_scoring_date = Math.min(...this.selected_sets.map(_set => _set.reduced_scoring_date))
      this.due_date = Math.min(...this.selected_sets.map(_set => _set.due_date))
      this.answer_date = Math.min(...this.selected_sets.map(_set => _set.answer_date))
    }
  },
  computed: {
    getSetNames(){
      return this.selected_sets.map(_set => _set.set_id).join(", ")
    },
    compOpenDate: {
      get(){ return common.formatDatetimeForBrowser(this.open_date);},
      set(value){this.open_date = common.parseDatetimeForBrowser(value);}
    }, // compOpenDate
    compReducedScoringDate: {
      get(){ return common.formatDatetimeForBrowser(this.reduced_scoring_date);},
      set(value){this.reduced_scoring_date = common.parseDatetimeForBrowser(value);}
    }, // compReducedScoringDate
    compDueDate: {
      get(){ return common.formatDatetimeForBrowser(this.due_date);},
      set(value){this.due_date = common.parseDatetimeForBrowser(value);}
    }, // compDueDate
    compAnswerDate: {
      get(){ return common.formatDatetimeForBrowser(this.answer_date);},
      set(value){this.answer_date = common.parseDatetimeForBrowser(value);}
    }, // compOpenDate
    validReducedScoring(){
      return moment.unix(this.reduced_scoring_date).isAfter(moment.unix(this.open_date))},
    validDueDate(){
      return moment.unix(this.due_date).isAfter(moment.unix(this.reduced_scoring_date))},
    validAnswerDate(){
      return moment.unix(this.answer_date).isAfter(moment.unix(this.due_date))}
  }, // computed
  methods: {
    save(){
      this.selected_sets.forEach( _set => {
        _set.visible = this.visible;
        _set.enable_reduced_scoring = this.enable_reduced_scoring;
        _set.open_date = this.open_date;
        _set.reduced_scoring_date = this.reduced_scoring_date;
        _set.due_date = this.due_date;
        _set.answer_date = this.answer_date;

        this.$store.dispatch("updateProblemSet",_set)
      })

      this.$bvModal.hide('edit-problem-sets-modal')
    }
  }
}
</script>

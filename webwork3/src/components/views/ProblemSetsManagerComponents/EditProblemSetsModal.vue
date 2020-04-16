<!-- EditProblemSetModal.vue

This is modal from the ProblemSetManager to edit a given problem set. -->

<script lang="ts">
import { Component, Watch, Prop } from "vue-property-decorator";
import { mixins } from "vue-class-component";

import ProblemSetMixin from "@/mixins/problem_set_mixin";

import {
  validReducedScoring,
  validAnswerDate,
  validDueDate,
  newProblemSet,
  formatDateTime,
} from "@/common";
import { ProblemSet } from "@/store/models";

import problem_sets_store from "@/store/modules/problem_sets";

@Component({
  name: "EditProblemSetsModal",
})
export default class SetInfo extends mixins(ProblemSetMixin) {
  private problem_set: ProblemSet = newProblemSet();
  @Prop() private selected_sets!: ProblemSet[];

  @Watch("selected_sets")
  private selectedSetsChanged() {
    const sets = this.selected_sets || [];
    this.problem_set.open_date = Math.min(
      ...sets.map((_set) => _set.open_date)
    );
    this.problem_set.reduced_scoring_date = Math.min(
      ...sets.map((_set) => _set.reduced_scoring_date)
    );
    this.problem_set.due_date = Math.min(...sets.map((_set) => _set.due_date));
    this.problem_set.answer_date = Math.min(
      ...sets.map((_set) => _set.answer_date)
    );
  }

  private formatDateAndTime(value: number) {
    return formatDateTime(value);
  }

  private get set_names() {
    return this.selected_sets.map((_set) => _set.set_id).join(", ");
  }

  private save() {
    this.selected_sets.forEach((_set) => {
      const {
        enable_reduced_scoring,
        visible,
        open_date,
        reduced_scoring_date,
        due_date,
        answer_date,
      } = this.problem_set;
      Object.assign(_set, {
        enable_reduced_scoring,
        visible,
        open_date,
        reduced_scoring_date,
        due_date,
        answer_date,
      });
      problem_sets_store.updateProblemSet(_set);
    });

    this.$bvModal.hide("edit-problem-sets-modal");
    this.$emit("update-set");
  }

  get valid_reduced_scoring() {
    return validReducedScoring(this.problem_set);
  }

  get valid_due_date() {
    return validDueDate(this.problem_set);
  }

  get valid_answer_date() {
    return validAnswerDate(this.problem_set);
  }
}
</script>

<template>
  <b-modal
    id="edit-problem-sets-modal"
    ref="sfmodal"
    size="lg"
    title="Edit Problem Sets"
    ok-title="Save and Close"
    @ok="save"
  >
    <b-container fluid>
      <b-row>
        <b-col cols="5">Set Name(s)</b-col>
        <b-col cols="5">{{ set_names }}</b-col>
      </b-row>
      <b-form-group label-cols="5" label="Visible">
        <b-checkbox v-model="problem_set.visible" />
      </b-form-group>
      <b-form-group label-cols="5" label="Reduced Scoring">
        <b-checkbox v-model="problem_set.enable_reduced_scoring" />
      </b-form-group>
      <b-form-group label-cols="5" label="Open Date">
        <b-input
          :value="formatDateAndTime(problem_set.open_date)"
          type="datetime-local"
          @blur="setOpenDate(problem_set, $event.target.value)"
        />
      </b-form-group>
      <b-form-group
        label-cols="5"
        label="Reduced Scoring Date"
        invalid-feedback="This date must be after the open date."
      >
        <b-input
          :value="formatDateAndTime(problem_set.reduced_scoring_date)"
          type="datetime-local"
          :state="valid_reduced_scoring"
          @blur="setReducedScoringDate(problem_set, $event.target.value)"
        />
      </b-form-group>
      <b-form-group
        label-cols="5"
        label="Due Date"
        invalid-feedback="This date must be after the reduced scoring date."
      >
        <b-input
          :value="formatDateAndTime(problem_set.due_date)"
          type="datetime-local"
          :state="valid_due_date"
          @blur="setDueDate(problem_set, $event.target.value)"
        />
      </b-form-group>
      <b-form-group
        label-cols="5"
        label="Answer Date"
        invalid-feedback="This date must be after the due date."
      >
        <b-input
          :value="formatDateAndTime(problem_set.answer_date)"
          type="datetime-local"
          :state="valid_answer_date"
          @blur="setAnswerDate(problem_set, $event.target.value)"
        />
      </b-form-group>
    </b-container>
  </b-modal>
</template>

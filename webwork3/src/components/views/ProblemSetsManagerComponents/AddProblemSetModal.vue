<!-- AddProblemSetModal.vue

This is modal from the ProblemSetManager to add a new problem set. -->

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import dayjs from "dayjs";

import customParseFormat from "dayjs/plugin/customParseFormat";
dayjs.extend(customParseFormat);

import { newProblemSet } from "@/common";

import { ProblemSet } from "@/store/models";

// set up the store
import problem_set_store from "@/store/modules/problem_sets";
import settings_store from "@/store/modules/settings";

@Component({
  name: "AddProblemSetModal",
})
export default class AddProblemSetModal extends Vue {
  private problem_set: ProblemSet = newProblemSet();

  @Prop()
  private problem_sets!: Map<string, ProblemSet>;

  private get valid_name() {
    return /^[A-Za-z_][\w_]*$/.test(this.problem_set.set_id);
  }

  private get set_not_defined(): boolean {
    return (
      problem_set_store.problem_sets.get(this.problem_set.set_id) === undefined
    );
  }

  private feedback(): string {
    if (!this.valid_name) {
      return "The name is not a valid name.";
    } else if (!this.set_not_defined) {
      return "This name has already been used.";
    }
    return "";
  }

  private async addProblemSet() {
    // bvModalEvt.preventDefault();
    if (!this.valid_name || !this.set_not_defined) {
      return;
    }

    // update all of the dates.
    const setting = settings_store.settings.get("pg{timeAssignDue}");
    const time_assign_due_string = (setting && (setting.value as string)) || "";
    const time_assign_due = dayjs(time_assign_due_string, "hh:mma");
    const open_date = dayjs()
      .add(7, "day")
      .hour(time_assign_due.hour())
      .minute(time_assign_due.minute());
    const due_date = dayjs(open_date).add(10, "day");
    const reduced_scoring_date = dayjs(open_date).add(7, "day");
    const answer_date = dayjs(due_date).add(7, "day");

    Object.assign(this.problem_set, {
      open_date: open_date.unix(),
      due_date: due_date.unix(),
      reduced_scoring_date: reduced_scoring_date.unix(),
      answer_date: answer_date.unix(),
    });

    // add to the store state:
    await problem_set_store.addProblemSet(this.problem_set);

    this.$bvModal.hide("add-problem-set-modal");
    this.problem_set = newProblemSet();

    this.$emit("problem-set-added"); // this is a hacky way to get adding problem sets to update
  }
}
</script>

<template>
  <b-modal
    id="add-problem-set-modal"
    ref="add-prob-set-modal"
    title="Add A Problem Set"
    ok-title="Add Problem Set and Close"
    @ok="addProblemSet"
  >
    <b-container>
      <b-form-group
        label-cols="4"
        label="Problem Set Name"
        :invalid-feedback="feedback()"
      >
        <b-input
          ref="set_id"
          v-model="problem_set.set_id"
          :state="valid_name && set_not_defined"
        />
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

<!-- SetInfo.vue

This is a tab within the ProblemSetView that allows the viewing/editing of the basic parameters of the set. -->

<script lang="ts">
import { Component, Prop } from "vue-property-decorator";
import { mixins } from "vue-class-component";

import ProblemSetMixin from "@/mixins/problem_set_mixin";

import { ProblemSet, ProblemSetList } from "@/store/models";

import {
  formatDateTime, // eslint-disable-line @typescript-eslint/no-unused-vars
  validReducedScoring,
  validDueDate,
  validAnswerDate,
} from "@/common";

// set up the store
import problem_sets_store from "@/store/modules/problem_sets";
import users_store from "@/store/modules/users";
import settings_store from "@/store/modules/settings";

@Component({
  name: "SetInfo",
})
export default class SetInfo extends mixins(ProblemSetMixin) {
  @Prop()
  private problem_sets!: ProblemSetList;
  @Prop()
  private selected_set!: ProblemSet;

  private get problem_set() {
    return this.selected_set;
  }
  //private problem_set = newProblemSet(); // local copy of the problem set

  get num_problems(): number {
    return this.problem_set && this.problem_set.problems
      ? this.problem_set.problems.length
      : 0;
  }

  get users_assigned(): number {
    return this.problem_set.assigned_users.length;
  }

  get num_users(): number {
    return users_store.users.size;
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

  get reduced_scoring(): boolean {
    const setting = settings_store.settings.get(
      "pg{ansEvalDefaults}{enableReducedScoring}"
    );
    if (setting) {
      return ((setting.value as unknown) as boolean) || false;
    } else {
      return false;
    }
  }

  private formatDateAndTime(value: number){
    return formatDateTime(value);
  }

  private save() {
    if (
      validDueDate(this.problem_set) &&
      validReducedScoring(this.problem_set) &&
      validAnswerDate(this.problem_set)
    ) {
      problem_sets_store.updateProblemSet(this.problem_set);
    }
  }

  private assignAllUsers() {
    console.log("in assignAllUsers"); // eslint-disable-line no-console
    this.problem_set.assigned_users = Array.from(users_store.users.keys());
    this.save();
  }
}
</script>

<template>
  <table
    v-if="problem_set.set_id !== 'XXX'"
    class="table table-sm set-info-table"
  >
    <tbody>
      <tr>
        <td class="header">Set Name</td>
        <td>{{ problem_set.set_id.replace("_", " ") }}</td>
      </tr>
      <tr>
        <td>
          <b-form-group label="Open Date" class="header">
            <b-input
              size="sm"
              type="datetime-local"
              :value="formatDateAndTime(problem_set.open_date)"
              @blur="
                setOpenDate(problem_set, $event.target.value);
                save();
              "
            />
          </b-form-group>
        </td>
        <td>
          <b-form-group
            v-if="reduced_scoring"
            class="header"
            label="Reduced Scoring Date"
            invalid-feedback="This date must be after the open date."
          >
            <b-input
              size="sm"
              :value="formatDateAndTime(problem_set.reduced_scoring_date)"
              type="datetime-local"
              :state="valid_reduced_scoring"
              @blur="
                setReducedScoringDate(problem_set, $event.target.value);
                save();
              "
            />
          </b-form-group>
        </td>
      </tr>
      <tr>
        <td>
          <b-form-group
            label="Due Date"
            class="header"
            invalid-feedback="This date must be after the reduced scoring date."
          >
            <b-input
              size="sm"
              :value="formatDateAndTime(problem_set.due_date)"
              type="datetime-local"
              :state="valid_due_date"
              @blur="
                setDueDate(problem_set, $event.target.value);
                save();
              "
            />
          </b-form-group>
        </td>
        <td>
          <b-form-group
            class="header"
            label="Answer Date"
            invalid-feedback="This date must be after the due date."
          >
            <b-input
              size="sm"
              :value="formatDateAndTime(problem_set.answer_date)"
              type="datetime-local"
              :state="valid_answer_date"
              @blur="
                setAnswerDate(problem_set, $event.target.value);
                save();
              "
            />
          </b-form-group>
        </td>
      </tr>
      <tr>
        <td class="header">Problem Set Visible to Users</td>
        <td>
          <b-checkbox v-model="problem_set.visible" @change="save" />
        </td>
      </tr>
      <tr v-if="reduced_scoring">
        <td class="header">Reduced Scoring Enabled</td>
        <td>
          <b-checkbox
            v-model="problem_set.enable_reduced_scoring"
            @change="save"
          />
        </td>
      </tr>
      <tr>
        <td class="header">Hide Hints from Users</td>
        <td>
          <b-checkbox v-model="problem_set.hide_hint" @change="save" />
        </td>
      </tr>
      <tr>
        <td class="header">Set Type</td>
        <td>
          <b-select
            v-model="problem_set.assignment_type"
            size="sm"
            @change="save"
          >
            <option value="set">Homework</option>
            <option value="gateway">Gateway/Quiz</option>
            <option value="proctored_gateway">Proctored Gateway/Quiz</option>
          </b-select>
        </td>
      </tr>
      <tr>
        <td class="header">Number of Problems in Set</td>
        <td>{{ num_problems }}</td>
      </tr>
      <tr>
        <td class="header">Users Assigned:</td>
        <td>
          <span style="mr-3">{{ users_assigned }}/{{ num_users }}</span>
          <b-btn
            size="sm"
            class="float-right"
            variant="outline-dark"
            @click="assignAllUsers"
          >
            Assign to All Users
          </b-btn>
        </td>
      </tr>
    </tbody>
  </table>
</template>

<style scope>
.header {
  font-weight: bold;
}
table.set-info-table {
  max-width: 800px;
}
</style>

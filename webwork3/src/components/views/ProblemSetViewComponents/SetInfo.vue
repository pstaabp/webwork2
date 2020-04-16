<template>
  <table
    class="table table-sm set-info-table"
    v-if="problem_set.set_id !== 'XXX'"
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
              :value="problem_set.open_date | formatDateTime"
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
              :value="problem_set.reduced_scoring_date | formatDateTime"
              type="datetime-local"
              :state="validReducedScoring"
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
              :value="problem_set.due_date | formatDateTime"
              type="datetime-local"
              :state="validDueDate"
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
            <b-form-input
              size="sm"
              :value="problem_set.answer_date | formatDateTime"
              type="datetime-local"
              :state="validAnswerDate"
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
          <b-form-checkbox v-model="problem_set.visible" @change="save" />
        </td>
      </tr>
      <tr v-if="reduced_scoring">
        <td class="header">Reduced Scoring Enabled</td>
        <td>
          <b-form-checkbox
            v-model="problem_set.enable_reduced_scoring"
            @change="save"
          />
        </td>
      </tr>
      <tr>
        <td class="header">Hide Hints from Users</td>
        <td>
          <b-form-checkbox v-model="problem_set.hide_hint" @change="save" />
        </td>
      </tr>
      <tr>
        <td class="header">Set Type</td>
        <td>
          <b-form-select
            size="sm"
            v-model="problem_set.assignment_type"
            @change="save"
          >
            <option value="set">Homework</option>
            <option value="gateway">Gateway/Quiz</option>
            <option value="proctored_gateway">Proctored Gateway/Quiz</option>
          </b-form-select>
        </td>
      </tr>
      <tr>
        <td class="header">Number of Problems in Set</td>
        <td>{{ problemsLength }}</td>
      </tr>
      <tr>
        <td class="header">Users Assigned:</td>
        <td>
          <span style="mr-3">{{ users_assigned }}/{{ num_users }}</span>
          <b-btn
            size="sm"
            class="float-right"
            @click="assignAllUsers"
            variant="outline-dark"
          >
            Assign to All Users
          </b-btn>
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script lang="ts">
import { Vue, Component, Watch, Prop } from "vue-property-decorator";
import { mixins } from "vue-class-component";

import ProblemSetMixin from "@/mixins/problem_set_mixin";
import MessagesMixin from "@/mixins/messages_mixin";

import { ProblemSet, ProblemSetList } from "@/store/models";

import {
  difference,
  newProblemSet,
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
export default class SetInfo extends mixins(MessagesMixin, ProblemSetMixin) {
  @Prop()
  private problem_sets!: ProblemSetList;
  @Prop()
  private selected_set!: ProblemSet;

  private get problem_set() {
    return this.selected_set;
  }
  //private problem_set = newProblemSet(); // local copy of the problem set

  get problemsLength(): number {
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

  get validReducedScoring() {
    return validReducedScoring(this.problem_set);
  }

  get validDueDate() {
    return validDueDate(this.problem_set);
  }

  get validAnswerDate() {
    return validAnswerDate(this.problem_set);
  }

  get reduced_scoring(): boolean {
    console.log(settings_store.settings); // eslint-disable-line no-console
    return settings_store.settings.get(
      "pg{ansEvalDefaults}{enableReducedScoring}"
    ).value;
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

<style scope>
.header {
  font-weight: bold;
}
table.set-info-table {
  max-width: 800px;
}
</style>

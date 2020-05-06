<!-- AssignUsers.vue

This is a tab within the ProblemSetView that allows fine-grained assignment of users. -->

<script lang="ts">
import { Component, Watch, Prop } from "vue-property-decorator";
import { mixins } from "vue-class-component";

import ProblemSetMixin from "@/mixins/problem_set_mixin";
import { User, ProblemSet } from "@/store/models";

import {
  formatDateTime,
  validReducedScoring,
  validDueDate,
  validAnswerDate,
  newProblemSet,
  hasReducedScoring,
} from "@/common";

// set up the store
import users_store from "@/store/modules/users";

@Component({
  name: "AssignUsers",
  // mixins: [ProblemSetMixin],
})
export default class AssignUsers extends mixins(ProblemSetMixin) {
  private fields: string[] = ["user_id", "first_name", "last_name"];
  private selected_users: User[] = []; // which rows are selected
  private users: User[] = [];
  private per_page = 10;
  private current_page = 1;
  private filter_text = "";
  private show_info: string[] = [];
  private override_dates: ProblemSet = newProblemSet();
  private list_type = "assigned";

  @Prop() private problem_set!: ProblemSet; // the problem set to assign users

  @Watch("show_info", { deep: true })
  private showTogglesChanged() {
    this.fields = [
      ...["user_id", "first_name", "last_name"],
      ...this.show_info,
    ];
  }

  private assignUsers() {
    const users = this.selected_users.map((_u) => _u.user_id);
    const assigned_users = this.problem_set.assigned_users || [];
    this.problem_set.assigned_users = [...assigned_users, ...users];
  }

  private get valid_reduced_scoring() {
    return validReducedScoring(this.override_dates);
  }

  private get valid_due_date() {
    return validDueDate(this.override_dates);
  }

  private get valid_answer_date() {
    return validAnswerDate(this.override_dates);
  }

  get reduced_scoring(): boolean {
    return hasReducedScoring();
  }

  // get either assigned, unassigned or all users;
  private setUsers(): void {
    const assigned_users_ids =
      this.problem_set && this.problem_set.assigned_users
        ? this.problem_set.assigned_users
        : [];
    const all_user_ids = Array.from(users_store.users.keys());
    const unassigned_users_ids = all_user_ids.filter(
      (_id) => !assigned_users_ids.includes(_id)
    );

    if (this.list_type === "assigned") {
      this.users = Array.from(users_store.users.values()).filter((_u) =>
        assigned_users_ids.includes(_u.user_id)
      );
    } else if (this.list_type === "unassigned") {
      this.users = Array.from(users_store.users.values()).filter((_u) =>
        unassigned_users_ids.includes(_u.user_id)
      );
    } else {
      this.users = Array.from(users_store.users.values());
    }
  }

  private formatDateAndTime(value: number) {
    return formatDateTime(value);
  }

  @Watch("problem_set", { deep: true })
  private probSetChanged() {
    this.setUsers();
    Object.assign(this.override_dates, this.problem_set);
  }

  @Watch("list_type")
  private listChanged() {
    this.setUsers();
  }

  private mounted() {
    Object.assign(this.override_dates, this.problem_set);
    this.setUsers();
  }

  // get users(): User[] {
  //   return Array.from(users_store.users.values());
  // }

  @Watch("current_page")
  private onChangeCurrentPage(): void {
    this.setSelectedCheckboxes();
  }

  private save(): void {
    console.log("in save"); // eslint-disable-line no-console
  }

  private rowSelected(items: User[]): void {
    this.selected_users = items;
  }

  // private toggleAssigned(index: number): void {
  //   this.assigned[index] = !this.assigned[index];
  //   // get this user id of the selected user
  //   const users = this.users.slice(0);
  //   const user = users[(this.current_page - 1) * this.per_page + index].get('user_id');
  //   if (this.assigned[index]) { // add the user to the assigned users
  //     const _users = [...this.problem_set.get('assigned_users')];
  //     _users.push(user);
  //     this.problem_set.set({assigned_users: _users});
  //   } else { // remove the user from the assigned users
  //     this.problem_set.set({assigned_users: this.problem_set.get('assigned_users')
  //             .filter( (_user_id: string) => _user_id !== user)});
  //   }
  //
  // }
  //
  private setSelectedCheckboxes() {
    // get the users shown in the table:
    // const users = users_store.users_array.filter(
    //   (_u: User, i: number) =>
    //     i < this.current_page * this.per_page &&
    //     i >= (this.current_page - 1) * this.per_page
    // );
    // this.problem_set.assigned_users = users.map(
    //   (_u: User) => this.problem_set.assigned_users ? this.problem_set.assigned_users.includes(_u.user_id) : '');
    this.setUsers();
  }
}
</script>

<template>
  <b-container>
    <b-row>
      <b-col cols="2">
        <b-select v-model="list_type" size="sm" variant="outline-dark">
          <option value="assigned">Assigned Users</option>
          <option value="unassigned">Unassigned Users</option>
          <option value="all">All Users</option>
        </b-select>
      </b-col>
      <b-col cols="3">
        <b-input-group size="sm">
          <template #prepend>
            <b-input-group-text>Filter:</b-input-group-text>
          </template>
          <b-input v-model="filter_text" debounce="250" />
        </b-input-group>
      </b-col>
      <b-col cols="4">
        <b-form-group>
          <b-checkbox-group v-model="show_info">
            <b-checkbox value="section">Show Section</b-checkbox>
            <b-checkbox value="recitation">
              Show Recitation
            </b-checkbox>
          </b-checkbox-group>
        </b-form-group>
      </b-col>
      <b-col v-if="list_type === 'unassigned'" cols="2">
        <b-btn variant="outline-dark" size="sm" @click="assignUsers">
          Assign to Selected Users
        </b-btn>
      </b-col>
      <b-col v-else cols="2">
        <b-btn variant="outline-dark" size="sm" @click="save">
          Save Override Dates
        </b-btn>
      </b-col>
    </b-row>
    <b-row v-if="list_type === 'assigned'">
      <b-col>
        <b-form-group label="Open Date" class="header">
          <b-input
            size="sm"
            type="datetime-local"
            :value="formatDateAndTime(override_dates.open_date)"
            @blur="setOpenDate(override_dates, $event.target.value)"
          />
        </b-form-group>
      </b-col>
      <b-col v-if="reduced_scoring">
        <b-form-group
          class="header"
          label="Reduced Scoring Date"
          invalid-feedback="This date must be after the open date."
        >
          <b-input
            v-if="reduced_scoring"
            size="sm"
            :value="formatDateAndTime(override_dates.reduced_scoring_date)"
            :state="valid_reduced_scoring"
            type="datetime-local"
            @blur="setReducedScoringDate(override_dates, $event.target.value)"
          />
        </b-form-group>
      </b-col>

      <b-col>
        <b-form-group
          label="Due Date"
          class="header"
          invalid-feedback="This date must be after the reduced scoring date."
        >
          <b-input
            size="sm"
            :value="formatDateAndTime(override_dates.due_date)"
            :state="valid_due_date"
            type="datetime-local"
            @blur="setDueDate(override_dates, $event.target.value)"
          />
        </b-form-group>
      </b-col>
      <b-col>
        <b-form-group
          class="header"
          label="Answer Date"
          invalid-feedback="This date must be after the due date."
        >
          <b-input
            size="sm"
            :value="formatDateAndTime(override_dates.answer_date)"
            type="datetime-local"
            :state="valid_answer_date"
            @blur="setAnswerDate(override_dates, $event.target.value)"
          />
        </b-form-group>
      </b-col>
    </b-row>
    <b-row>
      <b-col>
        <b-table
          small
          :items="users"
          :fields="fields"
          selectable
          select-mode="range"
          :filter="filter_text"
          :current-page="current_page"
          :per-page="per_page"
          @row-selected="rowSelected"
        >
          <template #assigned="row">
            <b-checkbox
              v-model="assigned[row.index]"
              @change="toggleAssigned(row.index)"
            />
          </template>
        </b-table>
      </b-col>
    </b-row>

    <b-row>
      <b-col>
        <b-pagination
          v-model="current_page"
          limit="10"
          :total-rows="users.length"
          :per-page="per_page"
        />
      </b-col>
    </b-row>
  </b-container>
</template>

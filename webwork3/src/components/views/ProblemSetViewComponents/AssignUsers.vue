<template>
  <b-container>
    <b-row>
      <b-col cols="2">
        <b-select size="sm" variant="outline-dark" v-model="list_type">
          <option value="assigned">Assigned Users</option>
          <option value="unassigned">Unassigned Users</option>
          <option value="all">All Users</option>
        </b-select>
      </b-col>
      <b-col cols="3">
        <b-input-group size="sm">
          <b-input-group-text slot="prepend">Filter:</b-input-group-text>
          <b-input v-model="filter_text" debounce="250" />
        </b-input-group>
      </b-col>
      <b-col cols="4">
        <b-form-group>
          <b-form-checkbox-group v-model="show_info">
            <b-form-checkbox value="section">Show Section</b-form-checkbox>
            <b-form-checkbox value="recitation">
              Show Recitation
            </b-form-checkbox>
          </b-form-checkbox-group>
        </b-form-group>
      </b-col>
      <b-col cols="2" v-if="list_type === 'unassigned'">
        <b-btn variant="outline-dark" size="sm" @click="assignUsers">
          Assign to Selected Users
        </b-btn>
      </b-col>
      <b-col cols="2" v-else>
        <b-btn variant="outline-dark" size="sm" @click="save">
          Save Override Dates
        </b-btn>
      </b-col>
    </b-row>
    <b-row v-if="list_type === 'assigned'">
      <b-col cols="3">
        <b-form-group label="Open Date" class="header">
          <b-input
            size="sm"
            type="datetime-local"
            :value="override_dates.open_date | formatDateTime"
            @blur="setOpenDate(override_dates, $event.target.value)"
          />
        </b-form-group>
      </b-col>
      <b-col cols="3">
        <b-form-group
          class="header"
          label="Reduced Scoring Date"
          invalid-feedback="This date must be after the open date."
        >
          <b-input
            size="sm"
            :value="override_dates.reduced_scoring_date | formatDateTime"
            :state="validReducedScoring"
            type="datetime-local"
            @blur="setReducedScoringDate(override_dates, $event.target.value)"
          />
        </b-form-group>
      </b-col>

      <b-col cols="3">
        <b-form-group
          label="Due Date"
          class="header"
          invalid-feedback="This date must be after the reduced scoring date."
        >
          <b-input
            size="sm"
            :value="override_dates.due_date | formatDateTime"
            :state="validDueDate"
            type="datetime-local"
            @blur="setDueDate(override_dates, $event.target.value)"
          />
        </b-form-group>
      </b-col>
      <b-col cols="3">
        <b-form-group
          class="header"
          label="Answer Date"
          invalid-feedback="This date must be after the due date."
        >
          <b-form-input
            size="sm"
            :value="override_dates.answer_date | formatDateTime"
            type="datetime-local"
            :state="validAnswerDate"
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
          @row-selected="rowSelected"
          :filter="filter_text"
          :current-page="current_page"
          :per-page="per_page"
        >
          <template slot="assigned" slot-scope="row">
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

<script lang="ts">
import { Vue, Component, Watch, Prop } from "vue-property-decorator";
import { mixins } from "vue-class-component";
import * as moment from "moment";

import ProblemSetMixin from "@/mixins/problem_set_mixin";
import { User, ProblemSet } from "@/store/models";

import {
  validReducedScoring,
  validDueDate,
  validAnswerDate,
  newProblemSet
} from "@/common";

// set up the store
import users_store from "@/store/modules/users";

@Component({
  name: "AssignUsers"
  // mixins: [ProblemSetMixin],
})
export default class AssignUsers extends mixins(ProblemSetMixin) {
  private fields: string[] = ["user_id", "first_name", "last_name"];
  private selected_users: User[] = []; // which rows are selected
  private users: User[] = [];
  private per_page: number = 10;
  private current_page: number = 1;
  private filter_text: string = "";
  private show_info: string[] = [];
  private override_dates: ProblemSet = newProblemSet();
  private list_type: string = "assigned";

  @Prop() private problem_set!: ProblemSet; // the problem set to assign users

  @Watch("show_info", { deep: true })
  private showTogglesChanged(_old: string[], _new: string[]) {
    this.fields = [
      ...["user_id", "first_name", "last_name"],
      ...this.show_info
    ];
  }

  private assignUsers() {
    const _users = this.selected_users.map(_u => _u.user_id);
    const _assigned_users = this.problem_set.assigned_users || [];
    this.problem_set.assigned_users = [..._assigned_users, ..._users];
  }

  get validReducedScoring() {
    return validReducedScoring(this.override_dates);
  }

  get validDueDate() {
    return validDueDate(this.override_dates);
  }

  get validAnswerDate() {
    return validAnswerDate(this.override_dates);
  }

  // get either assigned, unassigned or all users;
  private setUsers(): void {
    const assigned_users_ids =
      this.problem_set && this.problem_set.assigned_users
        ? this.problem_set.assigned_users
        : [];
    const all_user_ids = Array.from(users_store.users.keys());
    const unassigned_users_ids = all_user_ids.filter(
      _id => !assigned_users_ids.includes(_id)
    );

    if (this.list_type === "assigned") {
      this.users = Array.from(users_store.users.values()).filter(_u =>
        assigned_users_ids.includes(_u.user_id)
      );
    } else if (this.list_type === "unassigned") {
      this.users = Array.from(users_store.users.values()).filter(_u =>
        unassigned_users_ids.includes(_u.user_id)
      );
    } else {
      this.users = Array.from(users_store.users.values());
    }
  }

  @Watch("problem_set", { deep: true })
  private probSetChanged(_new_set: ProblemSet, _old_set: ProblemSet) {
    this.setUsers();
    Object.assign(this.override_dates, this.problem_set);
  }

  @Watch("list_type")
  private listChanged(_new: ProblemSet, _old: ProblemSet) {
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
    const users = users_store.users_array.filter(
      (_u: User, i: number) =>
        i < this.current_page * this.per_page &&
        i >= (this.current_page - 1) * this.per_page
    );
    // this.problem_set.assigned_users = users.map(
    //   (_u: User) => this.problem_set.assigned_users ? this.problem_set.assigned_users.includes(_u.user_id) : '');
    this.setUsers();
  }
}
</script>

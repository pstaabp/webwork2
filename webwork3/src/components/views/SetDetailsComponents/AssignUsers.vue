<template>
  <b-container>
    <b-row>
      <b-col>Users assigned to {{set_id}}</b-col>
      <b-col v-if="selected_users.length == 0">
        <b-btn variant="outline-dark">Select Users to Override Dates</b-btn> </b-col>
      <b-col v-else>
        <b-btn variant="outline-dark" @click="save">Save Override Dates</b-btn> </b-col>
    </b-row>

    <b-row>
      <b-col>
        <b-table small :items="users" :fields="fields" selectable
          select-mode="range" @row-selected="rowSelected"
          :current-page="current_page" :per-page="per_page">
          <template slot="assigned" slot-scope="row">
            <b-checkbox v-model="assigned[row.index]" @change="toggleAssigned(row.index)" />
          </template>
        </b-table>
      </b-col>
    </b-row>

    <b-row>
      <b-col>
        <b-pagination v-model="current_page" limit="10"
          :total-rows="users.length" :per-page="per_page" />
      </b-col>
    </b-row>

    <b-row v-if="selected_users.length >0">
      <b-col cols="3">
        <b-form-group label="Open Date" class="header">
          <b-input size="sm" type="datetime-local" v-model="due_date" />
        </b-form-group>
      </b-col>
      <b-col cols="3">
        <b-form-group class="header" label="Reduced Scoring Date"
            invalid-feedback="This date must be after the open date.">
          <b-input size="sm" type="datetime-local" v-model="reduced_scoring_date" :state="validReducedScoring" />
        </b-form-group>
      </b-col>
      <b-col cols="3">
        <b-form-group label="Due Date" class="header"
              invalid-feedback="This date must be after the reduced scoring date.">
          <b-input size="sm" type="datetime-local" v-model="due_date" :state="validDueDate"/>
        </b-form-group>
      </b-col>
      <b-col cols="3">
        <b-form-group class="header" label="Answer Date"
              invalid-feedback="This date must be after the due date.">
          <b-input size="sm" v-model="answer_date" type="datetime-local" :state="validAnswerDate"/>
        </b-form-group>
      </b-col>
    </b-row>
  </b-container>
</template>



<script lang="ts">
import { Vue, Component, Watch, Prop } from 'vue-property-decorator';
import * as moment from 'moment';

// import ProblemSetMixin from '@/mixins/problem_set_mixin';

import User from '@/models/User';
import ProblemSet from '@/models/ProblemSet';

// set up the store
import { getModule } from 'vuex-module-decorators';
import WeBWorKStore from '@/store';
const store = getModule(WeBWorKStore);

@Component({
  name: 'AssignUsers',
  // mixins: [ProblemSetMixin],
})
export default class AssignUsers extends Vue {
  private assigned: boolean[] = []; // array of the checkboxes
  private fields: string[] = ['assigned', 'user_id', 'first_name', 'last_name'];
  private filter_out: RegExp = /^set_id:/;
  private selected_users: User[] = []; // which rows are selected
  private per_page: number =  10;
  private current_page: number = 1;
  private open_date_value: moment.Moment = moment.default();
  private reduced_scoring_date_value: moment.Moment = moment.default();
  private due_date_value: moment.Moment = moment.default();
  private answer_date_value: moment.Moment = moment.default();

  @Prop()
  private problem_set!: ProblemSet;

  get open_date() {
    return this.open_date_value.format('YYYY-MM-DD[T]HH:mm');
  }

  set open_date(value: string) {
    this.open_date_value = moment.default(value, 'YYYY-MM-DD[T]HH:mm');
  }

  get due_date() {
    return this.due_date_value.format('YYYY-MM-DD[T]HH:mm');
  }

  set due_date(value: string) {
    this.due_date_value = moment.default(value, 'YYYY-MM-DD[T]HH:mm');
  }

  get reduced_scoring_date() {
    return this.reduced_scoring_date_value.format('YYYY-MM-DD[T]HH:mm');
  }

  set reduced_scoring_date(value: string) {
    this.reduced_scoring_date_value = moment.default(value, 'YYYY-MM-DD[T]HH:mm');
  }

  get answer_date() {
    // tslint:disable-next-line
    console.log("in get");
    return this.answer_date_value.format('YYYY-MM-DD[T]HH:mm');
  }

  set answer_date(value: string) {
    // tslint:disable-next-line
    console.log("in set");
    this.answer_date_value = moment.default(value, 'YYYY-MM-DD[T]HH:mm');
  }

  get set_id() {
    return this.problem_set ? this.problem_set.get('set_id') : '';
  }

  get users(): object[] {
    return store.users.models().map( (_u) => _u.getAttributes());
  }

  @Watch('current_page')
  private onChangeCurrentPage(): void {
    this.setSelectedCheckboxes();
  }

  private save(): void {
    // tslint:disable-next-line
    console.log("in save");
  }

  private removeProctors(obj1: User, obj2: RegExp) {
    return !obj2.test(obj1.get('user_id'));
  }

  private rowSelected(items: User[]): void {
    this.selected_users = items;
  }

  private toggleAssigned(index: number): void {
    this.assigned[index] = !this.assigned[index];
    // get this user id of the selected user
    const users = store.users.models();
    const user = users[(this.current_page - 1) * this.per_page + index].get('user_id');
    if (this.assigned[index]) { // add the user to the assigned users
      const _users = [...this.problem_set.get('assigned_users')];
      _users.push(user);
      this.problem_set.set({assigned_users: _users});
    } else { // remove the user from the assigned users
      this.problem_set.set({assigned_users: this.problem_set.get('assigned_users')
              .filter( (_user_id: string) => _user_id !== user)});
    }

  }

  private setSelectedCheckboxes() {
    const users = store.users.models().filter((_u: User, i: number) => i < this.current_page * this.per_page &&
                                              i >= (this.current_page - 1) * this.per_page);
    this.assigned = users.map((user: User) => this.problem_set.get('assigned_users').includes(user.get('user_id')));
  }

  get validReducedScoring(): boolean {
    return this.reduced_scoring_date_value.isSameOrAfter(this.open_date_value);
  }

  get validDueDate(): boolean {
    return this.due_date_value.isSameOrAfter(this.reduced_scoring_date_value);
  }

  get validAnswerDate(): boolean {
    return this.answer_date_value.isSameOrAfter(this.due_date_value);
  }

}
</script>

<template>
  <div>
    <span v-if="items.length===0">Loading data...<b-spinner variant="primary" label="Loading"></b-spinner></span>
    <b-row v-if="items.length>0">
      <b-col cols="2">
        <b-checkbox v-model="all_users">Include All Users </b-checkbox>
      </b-col>
      <b-col>
        <b-form-group
        label-cols="auto"
        label="Export Filename"
        label-for="filename-export">
          <b-form-input id="filename-export" v-model="filename"></b-form-input>
        </b-form-group>
      </b-col>
      <b-col>
        <b-btn @click="download" variant="outline-dark">Download</b-btn>
      </b-col>

    </b-row>
    <b-table sticky-header="600px" :items="items" :fields="fields" striped small
      primary_key="user_id">
      <template v-slot:head()="data">
        {{formatHead(data)}}
      </template>
    </b-table>
  </div>
</template>


<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';

import { unparse } from 'papaparse';

import login_store from '@/store/modules/login';
import users_store from '@/store/modules/users';
import problem_sets_store from '@/store/modules/problem_sets';

import {fetchUserSetScores} from '@/store/api';

import {User, UserSetScore} from '@/store/models';

// Defintion for problem sets and the total value of the set
interface SetValue {
  set_id: string;
  value: number;
}

interface StringMap {
  [key: string]: string | number | boolean;
}



@Component({
  name: 'ScoringExport',
})
export default class ScoringExport extends Vue {
  private items: StringMap[] = [];
  private fields: StringMap[] = [];
  private set_values: SetValue[] = []; // store the value of each set
  private filename: string = '';
  private all_users: boolean = false;
  private user_set_scores: UserSetScore [] = [];



  private formatHead(data: {label: string; field: {key: string}} ) {
    const sv = this.set_values.find( (_sv: SetValue) => _sv.set_id === data.field.key);
    return data.label + (sv && sv.value ? (' Value: ' + sv.value) : '');
  }

  @Watch('all_users')
  private allUsersChanged() {
    this.buildTable();
  }


  private download() {
    const data = this.items.slice(0);
    // add a row for the max values:
    const row = {};
    Object.assign(row, {user_id: 'MAX value', first_name: '', last_name: ''},
      this.set_values.reduce( (obj: StringMap, item: SetValue) => {
          obj[item.set_id] = item.value; return obj;
        }, {}));
    data.splice(0, 0, row);
    const csv = unparse(data);
    const blob = new Blob([csv], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = this.filename;
    link.click();
    URL.revokeObjectURL(link.href);
    //this.clicked = true;
  }

  private buildTable() {
    const users = users_store.users_array;
    const set_names = problem_sets_store.set_names.sort();
    const sets = problem_sets_store.problem_sets;
    // take the output from the server (as a list of userset scores) and put the
    // result in a table form to display
    this.items = users.map( (_user: User) => {
      return this.user_set_scores.filter( (_set_score: StringMap) => _set_score.user_id === _user.user_id)
                    .reduce( (obj: StringMap, item: StringMap) => { obj[item.set_id] = item.set_score; return obj; },
            {user_id: _user.user_id, first_name: _user.first_name, last_name: _user.last_name, total: 0});
          });

    // If the all_users checkbox is not selected remove admins/professors and dropped students:
    if (! this.all_users) {
      const users_to_remove = Array.from(users.values()).filter(
              (_u: User) => _u.permission >= 10 || _u.status !== 'C').map( (_u: User) => _u.user_id);

      this.items = this.items.filter( (_item: {user_id: string}) => ! users_to_remove.includes(_item.user_id));
    }

    // calculate the total for each user
    this.items.forEach( (_row: StringMap ) => _row.total = set_names
                            .map( (_set: string) => _row[_set]).reduce( (x, y) => x + y, 0));

    // calculate the total value of each set.
    this.set_values = Array.from(sets.values()).map( (_set) =>
          ({set_id: _set.set_id, value: _set.problems.reduce(
                      (value: number, obj: SetValue) => value + obj.value, 0)}));

    // set up the fields property to set the table to be sortable:
    const name_fields = set_names.map( (_set_id: string) => (
      { key: _set_id, sortable: true, formatter: 'round2'}
    ));
    const info_fields = ['user_id', 'first_name', 'last_name'].map((_str: string) =>
        ({key: _str, sortable: true, stickyColumn: true}));
    this.fields = [...info_fields, ...name_fields, ...[{key: 'total', formatter: 'round2', sortable: true}]];
  }

  private async mounted() {
    this.user_set_scores = await fetchUserSetScores();
    this.buildTable();

    // set the filename
    this.filename = login_store.course_id + '_totals.csv';
  }

  private round2(value: number) {
    return Math.round(100 * value) / 100;
  }

}
</script>

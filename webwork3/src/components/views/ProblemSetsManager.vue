<template>
  <div>
    <b-container>
      <b-row class="pb-3">
        <b-col cols="3">
          <b-input-group size="sm">
            <b-form-input placeholder="Filter" v-model="filter_string"/>
            <b-input-group-append>
              <b-button size="sm" text="Button" @click="filter_string=''">X</b-button>
            </b-input-group-append>
          </b-input-group>
        </b-col>
        <b-col cols="9">
          <b-input-group size="sm" prepend="Show Time">
            <b-input-group-append is-text>
              <b-checkbox v-model="show_time"/>
            </b-input-group-append>
            <b-input-group-append>
              <b-btn v-b-modal.add-problem-set-modal>Add Problem Set</b-btn>
            </b-input-group-append>
            <b-dd variant="outline-dark" text="Action on Selected">
              <b-dd-item :disabled="selected_sets.length === 0" v-b-modal.edit-problem-sets-modal>Edit Problem Sets</b-dd-item>
              <b-dd-item :disabled="selected_sets.length === 0" @click="deleteSets">Delete Problem Sets</b-dd-item>
            </b-dd>
            <b-dd variant="outline-dark" text="Show Rows">
              <b-dd-item  default value="10">Show 10 rows</b-dd-item >
              <b-dd-item  value="25">Show 25 rows</b-dd-item >
              <b-dd-item  value="50">Show 50 rows</b-dd-item >
              <b-dd-item  value="0">Show all rows</b-dd-item >
            </b-dd>
          </b-input-group>
        </b-col>
      </b-row>
      <b-row>
        <b-table :items="problem_sets_as_array" :fields="fields" :small="true" :bordered="true"
        primary-key="set_id" @row-selected="rowSelected" :filter="filter_string" selectable >
        <template v-slot:cell(visible)="data" @row-dblclicked="editRow">
          <div class="mx-auto" width="100%">
            <b-icon icon="check-circle" class="text-success" v-if="data.value"/>
            <b-icon icon="x-circle-fill" class="text-danger" v-if="!data.value" />
          </div>
        </template>
        <template v-slot:cell(enable_reduced_scoring)="data">
          <div class="mx-auto" width="100%">
            <b-icon icon="check-circle" class="text-success" v-if="data.value"/>
            <b-icon icon="x-circle-fill" class="text-danger" v-if="!data.value" />
          </div>
        </template>
      </b-table>
    </b-row>
  </b-container>
  <!-- Note the @problem-set-added event is a hacky way to get rerending to work -->
  <add-problem-set-modal :problem_sets="problem_sets" @problem-set-added="problem_set_tracker += 1" />
  <edit-problem-sets-modal :selected_sets="selected_sets" />
</div>
</template>

<script lang="ts">
import { Vue, Component, Watch, Prop } from 'vue-property-decorator';
import {mixins} from 'vue-class-component';

import moment from 'moment';

// set up the store
import problem_sets_store from '@/store/modules/problem_sets';
import users_store from '@/store/modules/users';

import {ProblemSet} from '@/store/models';

import AddProblemSetModal from './ProblemSetsManagerComponents/AddProblemSetModal.vue';
import EditProblemSetsModal from './ProblemSetsManagerComponents/EditProblemSetsModal.vue';

import MessagesMixin from '@/mixins/messages_mixin';
import ProblemSetMixin from '@/mixins/problem_set_mixin';

@Component({
  name: 'ProblemSetsManager',
  components: {
    AddProblemSetModal,
    EditProblemSetsModal,
  }
})
export default class ProblemSetsManager extends mixins(MessagesMixin, ProblemSetMixin) {
  private fields = [
          {key: 'set_id', sortable: true, label: 'Name'},
          {key: 'assigned_users', sortable: true, label: 'Users', formatter: 'numUsers'},
          {key: 'problems', sortable: true, label: '# Probs.', formatter: 'numProbs'},
          {key: 'visible', sortable: true},
          {key: 'enable_reduced_scoring', label: 'RS'},
          {key: 'open_date', sortable: true, label: 'Open Date', formatter: 'formatDate'},
          {key: 'reduced_scoring_date', sortable: true, label: 'Red. Sc. Date', formatter: 'formatDate'},
          {key: 'due_date', sortable: true, label: 'Due Date', formatter: 'formatDate'},
          {key: 'answer_date', sortable: true, label: 'Answer Date', formatter: 'formatDate'},
      ];
  private selected_sets: ProblemSet[] = [];
  private show_time = false;
  private filter_string = '';
  private problem_set_tracker = 1; // a hacky way to get reaction to adding/remove problem sets.

  private get problem_sets() {
    // tslint:disable-next-line
    console.log(this.problem_set_tracker);
    return this.problem_set_tracker && problem_sets_store.problem_sets;
  }

  private get problem_sets_as_array() {
    return Array.from(problem_sets_store.problem_sets.values());
  }

  private editRow(item: ProblemSet) {
    // tslint:disable-next-line
    console.log(item);
  }

  private rowSelected(rows: ProblemSet[]) {
    this.selected_sets = rows;
  }

  private formatDate(_date: number) {
    return this.show_time ? moment.unix(_date).format('MM/DD/YY [at] hh:mm a') :
        moment.unix(_date).format('MM/DD/YYYY');
  }

  private numUsers(data: any[] ) {
    return data.length + '/' + users_store.users.size;
  }

  private numProbs(data: any[]) {
    return data.length;
  }

  private deleteSets() {
    const _sets = this.selected_sets.map( (_set) => _set.set_id);
    const conf = confirm('Are you sure you want to delete the following sets? ' + _sets);

    if (conf) {
      this.selected_sets.forEach( (_set) => {
        problem_sets_store.removeProblemSet(_set);
      });
      this.problem_set_tracker += 1;
    }
  }

}
</script>

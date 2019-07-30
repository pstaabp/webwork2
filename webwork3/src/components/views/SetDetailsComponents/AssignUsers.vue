<template>
  <b-container>
    <b-row>
      <b-col>Users assigned to {{set_id}}</b-col>
      <b-col v-if="selected_users.length == 0">
        <b-btn variant="outline-dark">Select Users to Override Dates</b-btn> </b-col>
      <b-col v-if="selected_users.length > 0">
        <b-btn variant="outline-dark" @click="save">Save Override Dates</b-btn> </b-col>
    </b-row>

    <b-row>
      <b-col>
        <b-table small :items="users" :fields="fields" :filter="filter_out" selectable
          :filter-function="removeProctors" select-mode="range" @row-selected="rowSelected"
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
          <b-input size="sm" type="datetime-local" v-model="displayDueDate" />
        </b-form-group>
      </b-col>
      <b-col cols="3">
        <b-form-group class="header" label="Reduced Scoring Date"
            invalid-feedback="This date must be after the open date.">
          <b-input size="sm" type="datetime-local" v-model="displayReducedScoringDate" :state="validReducedScoring" />
        </b-form-group>
      </b-col>
      <b-col cols="3">
        <b-form-group label="Due Date" class="header"
              invalid-feedback="This date must be after the reduced scoring date.">
          <b-input size="sm" type="datetime-local" v-model="displayDueDate" :state="validDueDate"/>
        </b-form-group>
      </b-col>
      <b-col cols="3">
        <b-form-group class="header" label="Answer Date"
              invalid-feedback="This date must be after the due date.">
          <b-input size="sm" v-model="displayAnswerDate" type="datetime-local" :state="validAnswerDate"/>
        </b-form-group>
      </b-col>
    </b-row>
  </b-container>
</template>



<script>
import { mapGetters, mapState } from 'vuex';
import ProblemSetMixin from '@/mixins/problem_set_mixin';

export default {
  name: 'AssignUsers',
  mixins: [ProblemSetMixin],
  data() {
    return {
      assigned: [], // array of the checkboxes
      fields: ['assigned', 'user_id', 'first_name', 'last_name'],
      filter_out: /^set_id:/,
      selected_users: [], // which rows are selected
      per_page: 10,
      current_page: 1,
    };
  },
  props: {
    problem_set: Object,
  },
  computed: {
    ...mapGetters(['getAssignedUsers', 'getUsers']),
    ...mapState(['users']),
    set_id() {
      return this.problem_set ? this.problem_set.set_id : '';
    },
  },
  watch: {
    current_page() {
      this.setSelectedCheckboxes();
    },
  },
  mounted() { // TODO: handle proctor users in a better way.
    // this.$store.watch(() => this.getAssignedUsers(this.set_id),
    //     _users => { this.setSelectedCheckboxes() });


        // I think this is to determine if the problem_set has been updated.
    // this.$store.watch(() => this.getSet(this.selected_set_id),
    //   _set => {
    //     const selected_set = {...this.getSet(this.selected_set_id)}; // make a copy of the set
    //     if (selected_set == undefined) {return;}
    //     Object.assign(this.problem_set, ...common.date_props.map(prop => ({[prop]: _set[prop]})));
    // });
  },
  methods: {
    removeProctors(obj1, obj2) {
      return !obj2.test(obj1.user_id);
    },
    rowSelected(items) {
      this.selected_users = items;
    },
    toggleAssigned(index) {
      this.assigned[index] = !this.assigned[index];
      // get this user id of the selected user
      const user = this.getUsers[(this.current_page - 1) * this.per_page + index].user_id;
      if (this.assigned[index]) { // add the user to the assigned users
        const _users = [...this.problem_set.assigned_users];
        _users.push(user);
        this.problem_set.assigned_users = _users;
      } else { // remove the user from the assigned users
        this.problem_set.assigned_users = this.problem_set.assigned_users.filter( (_u) => _u !== user);
      }

//      this.$store.dispatch("updateProblemSet",this.problem_set);
    },
    setSelectedCheckboxes() {
      const users = this.getUsers.filter((_u, i) => i < this.current_page * this.per_page &&
                                                i >= (this.current_page - 1) * this.per_page);
      this.assigned = users.map((user) => this.problem_set.assigned_users.includes(user.user_id));
    },
    save() {
      // save something here.
    },
  }, // methods
};
</script>

<template>
  <b-container>
    <b-row>
      <b-col>Users assigned to {{this.selected_set_id}}</b-col>
      <b-col v-if="selected_users.length == 0">
        <b-btn variant="outline-dark">Select Users to Override Dates</b-btn> </b-col>
      <b-col v-if="selected_users.length > 0">
        <b-btn variant="outline-dark" @click="save">Save Override Dates</b-btn> </b-col>
    </b-row>

    <b-row>
      <b-col>
        <b-table small :items="getUsers" :fields="fields" :filter="filter_out" selectable
          :filter-function="removeProctors" select-mode="range" @row-selected="rowSelected">
          <template slot="assigned" slot-scope="row">
            <b-checkbox v-model="users_assigned[row.index]" />
          </template>
        </b-table>
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
import {ProblemSetMixin} from '@/mixins/problem_set_mixin.js'
import common from '@/common.js'

export default {
  name: 'AssignUsers',
  mixins: [ProblemSetMixin],
  data: function(){
    return {
      users_assigned: [],
      fields: ["assigned","user_id","first_name","last_name"],
      filter_out: /^set_id:/,
      problem_set: common.new_problem_set,
      selected_users: [],
      loading: true
    }
  },
  props: {
    selected_set_id: String
  },
  computed: {
    getUsers(){
      return this.$store.state.users;
    //  return this.$store.getters.getUsers;
    }
  }, // computed
  watch: {
    users_assigned(){ // TODO: handle proctor users in a better way.
      var _set = {...this.$store.getters.getSet(this.selected_set_id)}; // make a copy of the set
      _set.assigned_users = this.$store.getters.getUsers.filter( (_u,i) => this.users_assigned[i]).map(_u => _u.user_id);
      if(!this.loading){
        this.$store.dispatch("updateProblemSet",_set)
      }
    }
  },
  mounted(){ // TODO: handle proctor users in a better way.
    this.$store.watch(() => this.$store.getters.getAssignedUsers(this.selected_set_id),
        _users => {
          const assigned_ids = this.$store.getters.getAssignedUsers(this.selected_set_id);
          this.users_assigned = this.$store.state.users.map(_u => assigned_ids.includes(_u.user_id));
    });

    this.$store.watch(() => this.$store.getters.getSet(this.selected_set_id),
      _set => {
        const selected_set = {...this.$store.getters.getSet(this.selected_set_id)}; // make a copy of the set
        if (selected_set == undefined) {return;}
        Object.assign(this.problem_set, ...common.date_props.map(prop => ({[prop]: _set[prop]})));
    });
    this.loading = false;
  },
  methods: {
    removeProctors(obj1,obj2){
      return !obj2.test(obj1.user_id);
    },
    rowSelected(items) {
      this.selected_users = items
    },
    save(){

    }
  } // methods
}
</script>

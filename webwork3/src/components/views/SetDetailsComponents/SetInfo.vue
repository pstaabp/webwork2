<template>
  <table class="table table-sm set-info-table">
    <tbody>
      <tr>
        <td class="header">Set Name</td><td>{{displaySet(problem_set.set_id)}}</td>
      </tr>
      <tr>
        <td><b-form-group label="Open Date" class="header">
          <b-input size="sm" type="datetime-local" v-model="displayOpenDate" /></b-form-group></td>
        <td>
          <b-form-group class="header" label="Reduced Scoring Date"
              invalid-feedback="This date must be after the open date.">
            <b-form-input size="sm" v-model="displayReducedScoringDate" type="datetime-local" :state="validReducedScoring"/>
          </b-form-group>
        </td>
      </tr>
      <tr>
        <td><b-form-group label="Due Date" class="header"
              invalid-feedback="This date must be after the reduced scoring date.">
          <b-input size="sm" type="datetime-local" v-model="displayDueDate" :state="validDueDate"/>
        </b-form-group></td>
        <td><b-form-group class="header" label="Answer Date"
              invalid-feedback="This date must be after the due date.">
            <b-form-input size="sm" v-model="displayAnswerDate" type="datetime-local" :state="validAnswerDate"/>
          </b-form-group>
        </td>
      </tr>
      <tr><td class="header">Problem Set Visible to Users</td>
        <td> <b-form-checkbox v-model="problem_set.visible" /></td></tr>
      <tr><td class="header">Reduced Scoring Enabled</td>
        <td> <b-form-checkbox v-model="problem_set.enable_reduced_scoring" /></td></tr>
      <tr><td class="header">Hide Hints from Users</td>
        <td> <b-form-checkbox v-model="problem_set.hide_hint" /></td></tr>
      <tr><td class="header">Set Type</td><td><b-form-select size="sm" v-model="problem_set.assignment_type">
        <option value="default">Homework</option>
        <option value="gateway">Gateway/Quiz</option>
        <option value="proctored_gateway">Proctored Gateway/Quiz</option>
      </b-form-select></td></tr>
      <tr><td class="header">Number of Problems in Set</td><td>{{problemsLength}}</td></tr>
      <tr><td class="header">Users Assigned</td>
        <td><b-btn size="sm" variant="outline-dark">Assign to All Users</b-btn></td>
      </tr>
      <tr v-if="proctored">
          <td class="header" style="color: darkblue; font-style:italic">
            Proctored Gateway/Quiz parameters</td><td></td></tr>
      <tr v-if="proctored"><td colspan="2">
        Proctored tests require proctor authorization to start and to grade.
        Provide a password to have a single password for all students to
        start a proctored test.</td></tr>
      <tr v-if="proctored">
        <td class="w-50 header">Password (Leave blank for regular proctoring)</td>
        <td class="w-25"><b-form-input size="sm" v-model="pg_password" type="password" /></td></tr>
      <tr v-if="gateway"><td class="header" style="color: darkblue; font-style:italic">
          Gateway/Quiz parameters</td><td></td></tr>
      <tr v-if="gateway"><td class="header">Test Time Limit (min; 0=Due Date)</td>
        <td><b-form-input size="sm" type="text" v-model="problem_set.version_time_limit" /></td></tr>
      <tr v-if="gateway"><td class="header">Cap Test Time at Set Due Date?</td>
        <td><b-form-checkbox v-model="problem_set.time_limit_cap" /></td></tr>
      <tr v-if="gateway"><td class="header">Number of Graded Submissions per Test (0=infty)</td>
        <td><b-form-input size="sm" type="text" v-model="problem_set.attempts_per_version" /></td></tr>
      <tr v-if="gateway"><td class="header">Time Interval for New Test Versions (min; 0=infty)</td>
        <td><b-form-input size="sm" type="text" v-model="problem_set.time_interval" /></td></tr>
      <tr v-if="gateway"><td class="header">Number of Tests per Time Interval (0=infty)</td>
        <td><b-form-input size="sm" type="text" v-model="problem_set.version_per_interval" /></td></tr>
      <tr v-if="gateway"><td class="header">	Order Problems Randomly</td>
        <td><b-form-checkbox v-model="problem_set.problem_random_order" /></td></tr>
      <tr v-if="gateway"><td class="header">Number of Problems per Page (0=all)</td>
        <td><b-form-input size="sm" type="text" v-model="problem_set.problems_per_page" /></td></tr>
      <tr v-if="gateway"><td class="header">Show Scores on Finished Assignments?</td>
        <td><b-form-select size="sm">
          <option value="N:">Yes</option>
          <option value="Y:N">No</option>
          <option value="BeforeAnswerDate:N">Only After Set Answer Date</option>
          <option value="Y:Y">Totals only (not problem scores)</option>
          <option value="BeforeAnswerDate:Y">Totals only, only after answer date</option>
        </b-form-select></td>
      </tr>
      <tr v-if="gateway"><td class="header">Show Problems on Finished Tests?</td>
        <td><b-form-select size="sm">
          <option value="N">Yes</option>
          <option value="Y">No</option>
          <option value="BeforeAnswerDate">Only After Set Answer Date</option>
        </b-form-select></td>
      </tr>
    </tbody>
  </table>
</template>



<script>
//import moment from 'moment'
import common from '../../../common'
import {ProblemSetMixin} from '../../../mixins/problem_set_mixin.js'
import MessagesMixin from '@/mixins/messages_mixin.js'

export default {
  name: 'SetInfo',
  mixins: [ProblemSetMixin,MessagesMixin],
  props: {
    problem_sets: Array,
    problem_set: Object
  },
  data: function() {
    return {
      show_time: false,
      data_loaded: false,
      pg_password: "" , // how to handle this?
      data_loading: true,
      set_params: common.new_problem_set
    }
  },
  computed: {
    problemsLength: function (){
      return this.problem_set.problems ? this.problem_set.problems.length : 0;
    },
    proctored: function () {
      return  this.problem_set.assignment_type =='proctored_gateway'},
    gateway: function () { return this.problem_set.assignment_type=='gateway' ||
        this.problem_set.assignment_type =='proctored_gateway'}
  },
  // watch: {
  //   problem_sets: function(){
  //     // eslint-disable-next-line
  //     console.log("problem sets changed")
  //     this.problem_set = this.problem_sets.find(_set => _set.set_id == this.selected_set_id)
  //     Object.assign(this.set_params,this.problem_set);
  //   }
  // }
}
</script>

<style scope>
.header {font-weight: bold}
table.set-info-table {max-width: 800px}
</style>

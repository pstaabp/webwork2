<template>
  <table class="table table-sm">
    <tbody>
      <tr>
        <td class="header">Set Name</td><td>{{selected_set.set_id}}</td>
        <td><b-form-checkbox v-model="show_time"><i class="far fa-clock"></i> </b-form-checkbox></td>
      </tr>
      <tr><td class="header">Open Date</td><td><DateTimePicker :selected_set="selected_set" date_type="open_date" :show_time="show_time" /></td></tr>
      <tr><td class="header">Reduced Scoring Date</td><td><DateTimePicker :selected_set="selected_set" date_type="reduced_scoring_date" :show_time="show_time" /></td></tr>
      <tr><td class="header">Due Date</td><td><DateTimePicker :selected_set="selected_set" date_type="due_date" :show_time="show_time" /></td></tr>
      <tr><td class="header">Answer Date</td><td><DateTimePicker :selected_set="selected_set" date_type="answer_date" :show_time="show_time" /></td></tr>
      <tr><td class="header">Problem Set Visible to Users</td>
        <td> <b-form-checkbox v-model="selected_set.visible" /></td></tr>
      <tr><td class="header">Reduced Scoring Enabled</td>
        <td> <b-form-checkbox v-model="selected_set.enable_reduced_scoring" /></td></tr>
      <tr><td class="header">Hide Hints from Users</td>
        <td> <b-form-checkbox v-model="selected_set.hide_hint" /></td></tr>
      <tr><td class="header">Set Type</td><td><b-form-select size="sm" v-model="selected_set.assignment_type">
        <option value="default">Homework</option>
        <option value="gateway">Gateway/Quiz</option>
        <option value="proctored_gateway">Proctored Gateway/Quiz</option>
      </b-form-select></td></tr>
      <tr><td class="header">Number of Problems in Set</td><td>{{problemsLength}}</td></tr>
      <tr><td class="header">Users Assigned</td>
        <td></td>
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
        <td><b-form-input size="sm" type="text" v-model="selected_set.version_time_limit" /></td></tr>
      <tr v-if="gateway"><td class="header">Cap Test Time at Set Due Date?</td>
        <td><b-form-checkbox v-model="selected_set.time_limit_cap" /></td></tr>
      <tr v-if="gateway"><td class="header">Number of Graded Submissions per Test (0=infty)</td>
        <td><b-form-input size="sm" type="text" v-model="selected_set.attempts_per_version" /></td></tr>
      <tr v-if="gateway"><td class="header">Time Interval for New Test Versions (min; 0=infty)</td>
        <td><b-form-input size="sm" type="text" v-model="selected_set.time_interval" /></td></tr>
      <tr v-if="gateway"><td class="header">Number of Tests per Time Interval (0=infty)</td>
        <td><b-form-input size="sm" type="text" v-model="selected_set.version_per_interval" /></td></tr>
      <tr v-if="gateway"><td class="header">	Order Problems Randomly</td>
        <td><b-form-checkbox v-model="selected_set.problem_random_order" /></td></tr>
      <tr v-if="gateway"><td class="header">Number of Problems per Page (0=all)</td>
        <td><b-form-input size="sm" type="text" v-model="selected_set.problems_per_page" /></td></tr>
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
import moment from 'moment'
import DateTimePicker from './DateTimePicker'

export default {
  name: 'SetInfo',
  components: {
    DateTimePicker
  },
  props: ['selected_set'],
  data: function() {
    return {
      show_time: false,
      data_loaded: false,
      pg_password: "" , // how to handle this?
    }
  },
  computed: {
    problemsLength: function (){
      return this.selected_set.problems ? this.selected_set.problems.length : 0;
    },
    proctored: function () {
      return  this.selected_set.assignment_type =='proctored_gateway'},
    gateway: function () { return this.selected_set.assignment_type=='gateway' ||
        this.selected_set.assignment_type =='proctored_gateway'},

  },
  methods: {
    updateDate(date_type,value) {
      // eslint-disable-next-line
      console.log(value);
      const old_date = moment.unix(this.selected_set.get(date_type))
      const mins_since_midnight = old_date.hours()*60+old_date.minutes()
      const new_date = moment(value,"YYYY-MM-DD").unix() + mins_since_midnight;
      this.selected_set.set(date_type,new_date);
    }
  },
  beforeUpdate: function() {
    if(!this.data_loaded){
      // eslint-disable-next-line
          console.log("here");

      this.selected_set.on("change",(event) => {
        event.target.save({method: "PUT"})
      });
      this.data_loaded = true;
    }

  }
}
</script>

<style>
.header {font-weight: bold}
</style>

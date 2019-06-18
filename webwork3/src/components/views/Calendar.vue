<template>
  <b-container>
    <b-row>
      <b-col cols="3"><span id="month-name"> {{monthName}}</span></b-col>
      <b-col>
        <b-btn-toolbar key-nav  aria-label="Toolbar with button groups">
        <b-btn-group size="sm" class="outline-dark">
          <b-btn @click="shiftCalendar(-1)">Prev.</b-btn>
          <b-btn @click="today()">Today</b-btn>
          <b-btn @click="shiftCalendar(1)">Next</b-btn>
        </b-btn-group>
      </b-btn-toolbar>
      </b-col>
    </b-row>
    <b-row>
      <table class="table table-bordered table-sm" id="cal-table">
        <thead class="thead-light">
          <th v-for="day in dayNames" :key="day">{{day}}</th>
        </thead>
        <tbody>
          <CalendarRow v-for="day in first_days"
            :first_day_of_week="{date: day.date, month: day.month, year: day.year}"
            :problem_sets="problem_sets"
            :key="'row_'+ day.month +':' + day.date"/>
        </tbody>
      </table>
    </b-row>
  </b-container>
</template>



<script>
import {mapState} from 'vuex'

import CalendarRow from '../CalendarRow.vue'
import moment from 'moment'
export default {
  name: 'Calendar',
  components: {
    CalendarRow
  },
  data: function () {
      return {
        first_days: []
      }
  },
  computed: {
    ...mapState(['problem_sets']),
    monthName: () => {
      return moment().format("MMMM YYYY");
    },
    dayNames: () => {
      return moment.weekdays();
    }
  },
  methods: {
    shiftCalendar(week){
      var first
      if(week==0){
        const now = moment()
        first = moment().subtract(now.days(),'days')
        while (first.get('month') == now.get('month')){
          first = first.subtract(7,'days')
        }
      } else {
        first = new moment({month: this. first_days[0].month, date: this.first_days[0].date,
                  year: this.first_days[0].year})
        first.add(week,"weeks")
      }
      // this produces an array of the days of the first of the week.
        this.first_days = [0,1,2,3,4,5].map(i=>{
          var d = moment(first).add(i*7,'days');
          return {month: d.get('month'), date: d.get('date'), year: d.get('year')}
        });
    }
  },
  created: function () {
    this.shiftCalendar(0);
  }
}
</script>

<style>
  #month-name { font-size: 120%; font-weight: bold;}
  .cal-table {width: 100%}
</style>

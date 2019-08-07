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
            :first_day_of_week="day"
            :problem_sets="problem_sets"
            :key="day.format('DD-MM-YYYY')"/>
        </tbody>
      </table>
    </b-row>
  </b-container>
</template>



<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';

// set up the store
import { getModule } from 'vuex-module-decorators';
import WeBWorKStore from '@/store';
const store = getModule(WeBWorKStore);


import CalendarRow from './CalendarComponents/CalendarRow.vue';
import * as moment from 'moment';

import ProblemSetList from '@/models/ProblemSetList';

@Component({
  name: 'Calendar',
  components: {
    CalendarRow,
  },
})
export default class Calendar extends Vue {
  private first_days!: moment.Moment[];  // the first of the week for the calendar.


  get monthName(): string {
    return moment.default().format('MMMM YYYY');
  }

  get dayNames(): string[] {
    return moment.weekdays();
  }

  get problem_sets(): ProblemSetList {
    return store.problem_sets;
  }

  public created(): void {
    this.shiftCalendar(0);
  }

  private shiftCalendar(week: number) {
    let first: moment.Moment = moment.default();
    if (week === 0) {
      const now = moment.default();
      first = moment.default().subtract(now.days(), 'days');
      while (first.get('month') === now.get('month')) {
        first = first.subtract(7, 'days');
      }
    } else {
      first = moment.default(this.first_days[0]);
      first.add(week, 'weeks');
    }
    // this produces an array of the days of the first of the week.
    this.first_days = [0, 1, 2, 3, 4, 5].map( (i) => moment.default(first).add(7 * i, 'days'));
  }

}
</script>

<style>
  #month-name { font-size: 120%; font-weight: bold;}
  .cal-table {width: 100%}
</style>

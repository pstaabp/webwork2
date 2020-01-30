<template>
  <b-container>
    <b-row class="pb-2">
      <b-col>
        <span id="month-name"> {{monthName}}</span>
      </b-col>
      <b-col>
        <b-btn-toolbar key-nav  aria-label="Toolbar with button groups">
          <b-btn-group size="sm">
            <b-btn variant="outline-dark" @click="changeWeek(-1)">Previous Week</b-btn>
            <b-btn variant="outline-dark" @click="today()">Today</b-btn>
            <b-btn variant="outline-dark" @click="changeWeek(1)">Next Week</b-btn>
          </b-btn-group>
        </b-btn-toolbar>
      </b-col>
      <b-col>
        <b-btn size="sm" variant="outline-dark"
          @click="sidebar_shown = !sidebar_shown"
          >{{(sidebar_shown ? "Hide " : "Show ") + "Problem Sets"}}
        </b-btn>
      </b-col>
    </b-row>
    <b-row>
      <b-col>
        <table class="table table-bordered table-sm" id="cal-table">
          <thead class="thead-light">
            <th v-for="day in dayNames" :key="day">{{day}}</th>
          </thead>
          <tbody>
            <CalendarRow v-for="day in first_days()"
              :first_day_of_week="day"
              :problem_sets="problem_sets"
              :key="first_day_of_calendar.format('DD') + ':' + day.format('DD-MM-YYYY')"/>
          </tbody>
        </table>
      </b-col>
      <b-col v-if="sidebar_shown" cols="2">
        <b-button-group vertical v-for="set_id in problem_set_names" v-bind:key="set_id">
          <b-btn variant="outline-primary" >{{set_id}}</b-btn>
        </b-button-group>
      </b-col>
    </b-row>
  </b-container>
</template>



<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import * as moment from 'moment';

import CalendarRow from './CalendarComponents/CalendarRow.vue';
import problem_set_store from '@/store/modules/problem_sets';
import {ProblemSet, ProblemSetList} from '@/store/models';

@Component({
  name: 'Calendar',
  components: {
    CalendarRow,
  },
})
export default class Calendar extends Vue {
  private first_day_of_calendar: moment.Moment = moment.default();
  private sidebar_shown = false;

  get monthName(): string {
    return moment.default().format('MMMM YYYY');
  }

  get dayNames(): string[] {
    return moment.weekdays();
  }

  get problem_sets(): ProblemSetList {
    return problem_set_store.problem_sets;
  }

  get problem_set_names(): string[] {
    return problem_set_store.set_names;
  }



  public created(): void {
    this.today();
  }

  private changeWeek(week: number) {
    this.first_day_of_calendar = moment.default(this.first_day_of_calendar).add(week * 7, 'days');
  }

  private today() {

    const now = moment.default();
    this.first_day_of_calendar = moment.default().subtract(now.days(), 'days'); // first of the week from today
    while (this.first_day_of_calendar.isSame(now, 'month')) {
      this.first_day_of_calendar = this.first_day_of_calendar.subtract(7, 'days');
    }

  }

  // this produces an array of the days of the first of the week.
  private first_days() {
    return [0, 1, 2, 3, 4, 5].map( (i) => moment.default(this.first_day_of_calendar).add(7 * i, 'days'));
  }

}
</script>

<style>
  #month-name { font-size: 120%; font-weight: bold;}
  .cal-table {width: 100%}
</style>

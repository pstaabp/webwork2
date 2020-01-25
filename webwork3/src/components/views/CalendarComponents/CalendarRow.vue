<template>
  <tr>
    <td v-for='(day,index) in week' class="cal-day" :key='day.format("YYYY-MM-DD")'
        :class="dayClass(day)" >{{shortDate(day)}}
      <div v-if='assignment_info.length>0'>
        <draggable v-model='assignment_info[index]' group='calendar' class='assignments'
            @start='drag=true' @end='drag=false' @change='assignChange(day,$event)'>
          <div v-for='assignment in assignment_info[index]' :key='assignment.id'
            :class='assignment.type' class='assign border rounded border-dark pl-1 p-0'>{{assignment.set_id}}</div>
        </draggable>
      </div>
    </td>
  </tr>
</template>

<script lang='ts'>
import Draggable, {MoveEvent} from 'vuedraggable';
import * as moment from 'moment';
import Constants from '@/common';

import { Vue, Component, Watch, Prop } from 'vue-property-decorator';

import {ProblemSet} from '@/store/models';

import problem_set_store from '@/store/modules/problem_sets';


interface AssignmentInfo {
  date: moment.Moment;
  type: string;
  set_id: string;
}

@Component({
  name: 'CalendarRow',
  components: {
    Draggable,
  },
})
export default class CalendarRow extends Vue {

  @Prop({ type: Object, validator: moment.isMoment })
  public readonly first_day_of_week!: moment.Moment;

  @Prop()
  public readonly problem_sets!: Map<string, ProblemSet>;

  private today: moment.Moment = moment.default();
  private items: AssignmentInfo[][] = [];

  // interface assign_info = {date: moment.Moment, type: string, set_id: string};


  get week(): moment.Moment[] {
    return [0, 1, 2, 3, 4, 5, 6].map((i: number) => moment.default(this.first_day_of_week).add(i, 'days'));
  }

  get assignment_info() {
    if (this.problem_sets.size > 0) {
      return this.week.map( (day: moment.Moment) => this.assignmentOnDate(day));
    } else {
      return [[], [], [], [], [], [], []];
    }
  }

  // returns the class for proper coloring of the calendar

  private dayClass(day: moment.Moment) {
    return this.today.isSame(day, 'day') ? 'today' :
      (this.today.isSame(day, 'month') ? 'current-month' : 'extra-month');
  }

  private shortDate(day: moment.Moment): string {
    return day.get('date') === 1 ? day.format('MMM D') : day.get('date').toString();
  }

  // Find all assignments with date on a given day.

  private assignmentOnDate(day: moment.Moment): AssignmentInfo[] {
    const allDates = Array.from(this.problem_sets.values()).flatMap( (_set) => [
        {date: moment.unix(_set.answer_date), type: 'answer', set_id: _set.set_id},
        {date: moment.unix(_set.due_date), type: 'due', set_id: _set.set_id},
        {date: moment.unix(_set.reduced_scoring_date), type: 'reduced', set_id: _set.set_id},
        {date: moment.unix(_set.open_date), type: 'open', set_id: _set.set_id}] )
          .map( (d) => Object.assign(d, {id: d.set_id + '___' + d.type}) );
    return allDates.filter( (_date: AssignmentInfo) => _date.date.isSame(day, 'day'));
  }

  private assignChange(newDate: moment.Moment, evt: MoveEvent<any>) {
    if (evt.hasOwnProperty('added')) {
      const d = moment.default(newDate);

      // adjust the time to be the same as the previous assignment time.
      d.hours(evt.added.element.date.hours());
      d.minutes(evt.added.element.date.minutes());
      // const _set = this.problem_sets.get(evt.added.element.set_id);
      // _set.set(evt.added.element.type + '_date', d.unix());
      const attrs: {[key: string]: any} = {};
      attrs[evt.added.element.type + '_date'] = d.unix();
      const _set = this.problem_sets.get(evt.added.element.set_id);
      if (_set) {
        // tslint:disable-next-line
        console.log("in assignChange");
        Object.assign(_set, attrs);
        problem_set_store.updateProblemSet(_set);
      }
    }
  }


}
</script>

<style scoped>
  .cal-day {height: 100px; width: 14.3%}
  .current-month {background: lightyellow}
  .extra-month {background: aliceblue}
  .today {background: lightpink}
  .open {background: lightgreen}
  .reduced {background-color: orange}
  .answer {background-color: lightblue}
  .due {background-color: red}
  .assign {font-size: 80%; cursor: move}
  .assignments {min-height: 50px}
  .nestable-item {margin-left: 0px}
  ol.nestable-list {list-style-type: none; padding-left: 5px}
</style>

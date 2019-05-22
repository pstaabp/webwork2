<template>
  <tr>
    <td v-for="(day,index) in getWeek" :key="formatDate(day)" class="cal-day"
        :class="isToday(day)?'today':inCurrentMonth(day)?'current-month':'extra-month'">
      <div>{{shortDate(day)}}</div>

      <div v-if="problem_sets">
        <draggable v-model="items[index]" group="calendar" class="assignments"
            @start="drag=true" @end="drag=false" @change="assignChange(formatDate(day),$event)">
          <div v-for="assignment in items[index]" :key="assignment.id"
            :class="assignment.type" class="assign border rounded border-dark pl-1 p-0">{{assignment.set_id}}</div>
        </draggable>
      </div>
    </td>
  </tr>
</template>

<script>
import draggable from 'vuedraggable'
import ProblemSetList from '../models/ProblemSetList.js'
import {SaveMixin} from "../mixins/save_mixin.js"

import moment from 'moment'

export default{
  name: 'CalendarRow',
  mixins: [SaveMixin],
  props: {
    first_day_of_week: Object,
    problem_sets: ProblemSetList
  },
  components: {
    draggable
  },
  computed: {
    getWeek: function() {
      const first=moment(this.first_day_of_week);
      return [0,1,2,3,4,5,6].map(i=>moment(first).add(i,'days'));
    }
  },
  data: function (){
    return {
      today: moment(),
      items: []
    }
  },
  methods: {
    shortDate: function(day){
      return day.get('date')==1? day.format("MMM D") : day.get("date");
    },
    inCurrentMonth: function(day){
      return day.get("month") == this.today.get('month');
    },
    isToday: function(day){
      return this.onSameDay(day,this.today);
    },
    formatDate: day => day.format("YYYY-MM-DD"),
    assignmentOnDate: function(day) {
     const _sets = this.problem_sets.models || [];
      var all_dates = _sets.flatMap(_set => [
          {date: moment.unix(_set.answer_date), type: "answer", set_id: _set.set_id},
          {date: moment.unix(_set.due_date), type: "due", set_id: _set.set_id},
          {date: moment.unix(_set.reduced_scoring_date), type: "reduced", set_id: _set.set_id},
          {date: moment.unix(_set.open_date), type: "open", set_id: _set.set_id}]).
            map( (d) => Object.assign(d, {id: d.set_id + "___" + d.type}) );
      return all_dates.filter(_date => this.onSameDay(_date.date,day));
    },
    onSameDay: (day1,day2) => day1.get('date') == day2.get('date') &&
                              day1.get('month') == day2.get('month') &&
                              day1.get('year') == day2.get('year'),
    assignChange: function(new_date,evt) {
      if(evt.hasOwnProperty("added")){

        const d = moment(new_date,"YYYY-MM-DD");
        d.hours(evt.added.element.date.hours())
        d.minutes(evt.added.element.date.minutes());
        var _set = this.problem_sets.find(_set => _set.set_id==evt.added.element.set_id);
        _set[evt.added.element.type+"_date"] = d.unix();
        // eslint-disable-next-line
        console.log(_set);
        this.saveProblemSet(_set);
      }
    }
  },
  created: function(){
    this.items = this.getWeek.map( day => this.assignmentOnDate(day));
  }
}
</script>

<style scoped>
</style>


<style>
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

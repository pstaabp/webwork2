<template>
  <tr>
    <td v-for="(day,index) in getWeek" :key="formatDate(day)" class="cal-day"
        :class="isToday(day)?'today':inCurrentMonth(day)?'current-month':'extra-month'">
      <div>{{shortDate(day)}}</div>

      <div v-if="problem_sets.length>0">
        <draggable v-model="items[index]" group="calendar" class="assignments"
            @start="drag=true" @end="drag=false" @change="assignChange(day,$event)">
          <div v-for="assignment in items[index]" :key="assignment.id"
            :class="assignment.type" class="assign border rounded border-dark pl-1 p-0">{{assignment.set_id}}</div>
        </draggable>
      </div>
    </td>
  </tr>
</template>

<script>
import draggable from 'vuedraggable'
import moment from 'moment'
import common from '@/common'

export default{
  name: 'CalendarRow',
  props: {
    first_day_of_week: Object,
    problem_sets: Array
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
  watch: {
    problem_sets(){
      // this is needed if the calendar is the initial view
      // however, it appears this is called many times more than needed.
      // is there a better place for this?

      this.items = this.getWeek.map( day => this.assignmentOnDate(day));
    }
  },
  data: function (){
    return {
      today: moment(),
      items: []
    }
  },
  methods: {
    formatDate: (_date) =>  common.formatDateForBrowser(_date),
    shortDate: (day) => day.get('date')==1? day.format("MMM D") : day.get("date"),
    inCurrentMonth: function(day) { return day.get("month") == this.today.get('month')},
    isToday: function(day){ return this.onSameDay(day,this.today)},
    assignmentOnDate: function(day) {
      const _sets = this.problem_sets || [];
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
        const d = moment(new_date)

        // adjust the time to be the same as the previous assignment time.
        d.hours(evt.added.element.date.hours())
        d.minutes(evt.added.element.date.minutes());
        var _set = Object.assign({},
            this.problem_sets.find(_set => _set.set_id==evt.added.element.set_id)); // make a copy of the set
        _set[evt.added.element.type+"_date"] = d.unix();
        this.$store.dispatch("updateProblemSet",_set);
      }
    }
  },
  created: function(){
    this.items = this.getWeek.map( day => this.assignmentOnDate(day));
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

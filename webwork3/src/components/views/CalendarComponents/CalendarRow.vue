<template>
  <tr>
    <td
      v-for="(day, index) in week"
      class="cal-day"
      :key="day.format('YYYY-MM-DD')"
      :class="dayClass(day)"
    >
      {{ shortDate(day) }}
      <draggable
        v-model="assignment_info[index]"
        group="calendar"
        class="assignments"
        @start="drag = true"
        @end="drag = false"
        @change="assignChange(day, $event)"
      >
        <div
          v-for="assignment in assignment_info[index]"
          :key="assignment.id"
          :class="assignment.type"
          class="assign border rounded border-dark pl-1 p-0"
        >
          {{ assignment.set_id }}
        </div>
      </draggable>
    </td>
  </tr>
</template>

<script lang="ts">
import Draggable, { ChangeEvent } from "vuedraggable";
import * as moment from "moment";
import Constants from "@/common";

import { Vue, Component, Watch, Prop } from "vue-property-decorator";

import { ProblemSet, ProblemSetList } from "@/store/models";

import problem_set_store from "@/store/modules/problem_sets";

interface AssignmentInfo {
  date: moment.Moment;
  type: string;
  set_id: string;
  due_date?: moment.Moment;
}

@Component({
  name: "CalendarRow",
  components: {
    Draggable
  }
})
export default class CalendarRow extends Vue {
  @Prop()
  private first_day_of_week!: moment.Moment;

  @Prop()
  private problem_sets!: ProblemSetList;

  @Prop()
  private all_assignment_dates!: AssignmentInfo[];

  private today: moment.Moment = moment.default();
  // private items: AssignmentInfo[][] = [];
  private drag: boolean = false;

  // interface assign_info = {date: moment.Moment, type: string, set_id: string};

  get week(): moment.Moment[] {
    return [0, 1, 2, 3, 4, 5, 6].map((i: number) =>
      moment.default(this.first_day_of_week).add(i, "days")
    );
  }

  private get assignment_info(): AssignmentInfo[][] {
    // console.log("in get assignment_info"); // eslint-disable-line no-console
    return this.week.map(_day =>
      this.all_assignment_dates.filter((_info: AssignmentInfo) =>
        _info.date.isSame(_day, "day")
      )
    );
  }

  @Watch("assignment_info")
  private changin() {
    // console.log("assignment_info changed"); // eslint-disable-line no-console
    // console.log(this.assignment_info); // eslint-disable-line no-console
  }

  // returns the class for proper coloring of the calendar
  private dayClass(day: moment.Moment) {
    return this.today.isSame(day, "day")
      ? "today"
      : this.today.isSame(day, "month")
      ? "current-month"
      : "extra-month";
  }

  private shortDate(day: moment.Moment): string {
    return day.get("date") === 1
      ? day.format("MMM D")
      : day.get("date").toString();
  }

  private assignChange(
    newDate: moment.Moment,
    evt: ChangeEvent<AssignmentInfo>
  ) {
    // console.log("dropping onto"); // eslint-disable-line no-console
    // console.log(evt); // eslint-disable-line no-console
    // console.log(newDate.format("MM/DD/YYYY")); // eslint-disable-line no-console
    //
    if (evt.hasOwnProperty("removed")) { // if the change event is fired but it is removed.
      return;
    } else if (evt.hasOwnProperty("added")) {
      const date_dropped_onto = moment.default(newDate); // make a copy of the date object
      const attrs: { [key: string]: number } = {};
      const _set = Object.assign({},problem_set_store.problem_sets.get(evt.added.element.set_id));
      // adjust the time to be the same as the previous assignment time.

      if (evt.added.element.date) { // it was dragged/changed from another calendar
        date_dropped_onto.hours(evt.added.element.date.hours());
        date_dropped_onto.minutes(evt.added.element.date.minutes());
        attrs[evt.added.element.type + "_date"] = date_dropped_onto.unix();
      } else if (evt.added.element.due_date) { // it was dragged from the sidebar

        // const open_date = ;
        // open_date.subtract(7, "days");
        //const answer_date = moment.default(date_dropped_onto);
        //answer_date.add(7, "days");
        attrs.due_date = date_dropped_onto.unix();
        attrs.reduced_scoring_date = moment.default(date_dropped_onto).unix();
        attrs.open_date = moment.default(date_dropped_onto).subtract(7,"days").unix();
        attrs.answer_date = moment.default(date_dropped_onto).add(7,"days").unix();
      }

      // console.log(attrs); // eslint-disable-line no-console
      const tmp = Object.keys(attrs).reduce(
        (obj: { [key: string]: string }, value: string) => {
          obj[value] = moment.unix(attrs[value]).format("MM/DD/YYYY");
          return obj;
        },
        {}
      );
      // console.log(tmp); // eslint-disable-line no-console

      if (_set) {
        // console.log("in assignChange"); // eslint-disable-line no-console
        Object.assign(_set, attrs);
        problem_set_store.updateProblemSet(_set);
      }
    }
  }
}
</script>

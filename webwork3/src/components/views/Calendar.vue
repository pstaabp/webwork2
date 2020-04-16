<template>
  <b-container>
    <b-row class="pb-2">
      <b-col>
        <span id="month-name"> {{ monthName }}</span>
      </b-col>
      <b-col>
        <b-btn-toolbar key-nav aria-label="Toolbar with button groups">
          <b-btn-group size="sm">
            <b-btn variant="outline-dark" @click="changeWeek(-1)">
              Previous Week
            </b-btn>
            <b-btn variant="outline-dark" @click="today()">Today</b-btn>
            <b-btn variant="outline-dark" @click="changeWeek(1)">
              Next Week
            </b-btn>
          </b-btn-group>
        </b-btn-toolbar>
      </b-col>
      <b-col>
        <b-btn
          size="sm"
          variant="outline-dark"
          @click="sidebar_shown = !sidebar_shown"
        >
          {{ (sidebar_shown ? "Hide " : "Show ") + "Problem Sets" }}
        </b-btn>
      </b-col>
    </b-row>
    <b-row>
      <b-col>
        <table class="table table-bordered table-sm" id="cal-table">
          <thead class="thead-light">
            <th v-for="day in dayNames" :key="day">{{ day }}</th>
          </thead>
          <tbody>
            <CalendarRow
              v-for="day in first_days()"
              :first_day_of_week="day"
              :problem_sets="problem_sets"
              :all_assignment_dates="all_assignment_dates"
              :key="
                first_day_of_calendar.format('DD') +
                  ':' +
                  day.format('DD-MM-YYYY')
              "
            />
          </tbody>
        </table>
      </b-col>
      <b-col v-if="sidebar_shown" cols="2">
        <h4>Problem Sets</h4>
        <b-list-group>
          <draggable
            v-model="problem_sets"
            group="calendar"
            :sort="false"
            ghost-class="ghost"
            @start="dragging = true"
            @end="dragging = false"
          >
            <b-list-group-item
              v-for="set_id in problem_set_names"
              :key="set_id"
              class="assignment-list"
            >
              {{ set_id }}
            </b-list-group-item>
          </draggable>
        </b-list-group>
      </b-col>
    </b-row>
  </b-container>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from "vue-property-decorator";
import * as moment from "moment";

import Draggable, { MoveEvent } from "vuedraggable";

import CalendarRow from "./CalendarComponents/CalendarRow.vue";
import problem_set_store from "@/store/modules/problem_sets";
import { ProblemSet, ProblemSetList } from "@/store/models";

interface AssignmentInfo {
  date: moment.Moment;
  type: string;
  set_id: string;
}

@Component({
  name: "Calendar",
  components: {
    CalendarRow,
    Draggable,
  },
})
export default class Calendar extends Vue {
  private first_day_of_calendar: moment.Moment = moment.default();
  private all_assignment_dates: AssignmentInfo[] = [];
  private sidebar_shown: boolean = false;
  private dragging: boolean = false;

  get monthName(): string {
    return moment.default().format("MMMM YYYY");
  }

  get dayNames(): string[] {
    return moment.weekdays();
  }

  get problem_sets(): ProblemSet[] {
    return Array.from(problem_set_store.problem_sets.values());
  }

  set problem_sets(_sets: ProblemSet[]) {
    // dummy function to get draggable working
  }

  get problem_set_names(): string[] {
    return problem_set_store.set_names;
  }

  private created(): void {
    this.all_assignment_dates = this.updateAssignmentDates(this.problem_sets);

    this.$store.subscribe((mutation, state) => {
      // any change to the problem sets and update the assignment dates.
      if (mutation.type === "problem_set_store/SET_PROBLEM_SET") {
        const set = mutation.payload as ProblemSet;
        this.all_assignment_dates = this.all_assignment_dates
          .filter((_info) => _info.set_id !== mutation.payload.set_id)
          .concat(this.updateAssignmentDates([set]));
        // console.log(this.all_assignment_dates); // eslint-disable-line no-console
      }
    });
  }

  // this method takes in sets and returns the individual dates (open, due, ...)
  // for placing on the calendar.

  private updateAssignmentDates(_sets: ProblemSet[]) {
    return _sets
      .flatMap((_set) => [
        {
          date: moment.unix(_set.answer_date),
          type: "answer",
          set_id: _set.set_id,
        },
        {
          date: moment.unix(_set.due_date),
          type: "due",
          set_id: _set.set_id,
        },
        {
          date: moment.unix(_set.reduced_scoring_date),
          type: "reduced_scoring",
          set_id: _set.set_id,
        },
        {
          date: moment.unix(_set.open_date),
          type: "open",
          set_id: _set.set_id,
        },
      ])
      .map((d) => Object.assign(d, { id: d.set_id + "___" + d.type }));
  }

  private changeWeek(week: number) {
    this.first_day_of_calendar = moment
      .default(this.first_day_of_calendar)
      .add(week * 7, "days");
  }

  private today() {
    const now = moment.default();
    this.first_day_of_calendar = moment.default().subtract(now.days(), "days"); // first of the week from today
    while (this.first_day_of_calendar.isSame(now, "month")) {
      this.first_day_of_calendar = this.first_day_of_calendar.subtract(
        7,
        "days"
      );
    }
  }

  // this produces an array of the days of the first of the week.
  private first_days() {
    return [0, 1, 2, 3, 4, 5].map((i) =>
      moment.default(this.first_day_of_calendar).add(7 * i, "days")
    );
  }
}
</script>

<style>
#month-name {
  font-size: 120%;
  font-weight: bold;
}
.cal-table {
  width: 100%;
}
.cal-day {
  height: 100px;
  width: 14.3%;
}
.current-month {
  background: lightyellow;
}
.extra-month {
  background: aliceblue;
}
.today {
  background: lightpink;
}
.open {
  background: lightgreen;
}
.reduced_scoring {
  background-color: orange;
}
.answer {
  background-color: lightblue;
}
.due {
  background-color: red;
}
.assign {
  font-size: 80%;
  cursor: move;
}
.assignments {
  min-height: 50px;
}
.nestable-item {
  margin-left: 0px;
}
ol.nestable-list {
  list-style-type: none;
  padding-left: 5px;
}
</style>

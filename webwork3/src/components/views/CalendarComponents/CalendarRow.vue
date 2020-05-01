<script lang="ts">
import Draggable, { ChangeEvent } from "vuedraggable";
import dayjs from "dayjs";

import { Vue, Component, Prop } from "vue-property-decorator";

import { ProblemSetList } from "@/store/models";

import problem_set_store from "@/store/modules/problem_sets";
import settings_store from "@/store/modules/settings";
import user_store from "@/store/modules/users";

interface AssignmentInfo {
  date: dayjs.Dayjs;
  type: string;
  set_id: string;
  due_date?: dayjs.Dayjs;
}

@Component({
  name: "CalendarRow",
  components: {
    Draggable,
  },
})
export default class CalendarRow extends Vue {
  @Prop() private first_day_of_week!: dayjs.Dayjs;
  @Prop() private problem_sets!: ProblemSetList;
  @Prop() private all_assignment_dates!: AssignmentInfo[];

  private today: dayjs.Dayjs = dayjs();
  private drag = false;

  private get week() {
    return [0, 1, 2, 3, 4, 5, 6].map((i: number) =>
      dayjs(this.first_day_of_week).add(i, "day")
    );
  }

  private get assignment_info(): AssignmentInfo[][] {
    return this.week.map((_day) =>
      this.all_assignment_dates.filter((_info: AssignmentInfo) =>
        _info.date.isSame(_day, "day")
      )
    );
  }

  private get num_users() {
    return user_store.users.size;
  }

  private getProblemSet(_set_id: string) {
    return problem_set_store.problem_sets.get(_set_id);
  }

  // determine if the reduced_scoring is enabled and show/hide accordingly.

  private show(_assignment: AssignmentInfo): string {
    const reduced_scoring_enabled = settings_store.settings.get(
      "pg{ansEvalDefaults}{enableReducedScoring}"
    );
    return reduced_scoring_enabled && reduced_scoring_enabled.value
      ? _assignment.type
      : _assignment.type === "reduced_scoring"
      ? "invisible"
      : _assignment.type;
  }

  // returns the class for proper coloring of the calendar
  private dayClass(day: dayjs.Dayjs): string {
    return this.today.isSame(day, "day")
      ? "today"
      : this.today.isSame(day, "month")
      ? "current-month"
      : day.month() % 2 === 0
      ? "even-month"
      : "odd-month";
  }

  private shortDate(day: dayjs.Dayjs): string {
    return day.get("date") === 1
      ? day.format("MMM D")
      : day.get("date").toString();
  }

  private assignChange(
    new_date: dayjs.Dayjs,
    evt: ChangeEvent<AssignmentInfo>
  ) {
    // console.log("dropping onto"); // eslint-disable-line no-console
    // console.log(evt); // eslint-disable-line no-console
    // console.log(newDate.format("MM/DD/YYYY")); // eslint-disable-line no-console
    //
    if (Object.prototype.hasOwnProperty.call(evt, "removed")) {
      // if the change event is fired but it is removed.
      return;
    } else if (Object.prototype.hasOwnProperty.call(evt, "added")) {
      const date_dropped_onto = dayjs(new_date); // make a copy of the date object
      const attrs: { [key: string]: number } = {};

      // make a copy of the set
      const set = Object.assign(
        {},
        this.getProblemSet(evt.added.element.set_id)
      );

      // adjust the time to be the same as the previous assignment time.

      if (evt.added.element.date) {
        // it was dragged/changed from another calendar
        date_dropped_onto.hour(evt.added.element.date.hour());
        date_dropped_onto.minute(evt.added.element.date.minute());
        attrs[evt.added.element.type + "_date"] = date_dropped_onto.unix();
      } else if (evt.added.element.due_date) {
        // it was dragged from the sidebar

        attrs.due_date = date_dropped_onto.unix();
        attrs.reduced_scoring_date = dayjs(date_dropped_onto).unix();
        attrs.open_date = dayjs(date_dropped_onto).subtract(7, "day").unix();
        attrs.answer_date = dayjs(date_dropped_onto).add(7, "day").unix();
      }
      if (set) {
        Object.assign(set, attrs);
        problem_set_store.updateProblemSet(set);
      }
    }
  }
}
</script>

<template>
  <tr>
    <td
      v-for="(day, index) in week"
      :key="day.format('YYYY-MM-DD')"
      class="cal-day"
      :class="dayClass(day)"
      style="border-color: rgb(150, 150, 150);"
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
          :class="show(assignment)"
          class="assign border rounded border-dark pl-1 p-0"
          :style="
            getProblemSet(assignment.set_id).visible ? '' : 'font-style: italic'
          "
        >
          {{ assignment.set_id }}
          <b-icon-question-circle-fill
            :id="assignment.id"
            class="float-right"
            font-scale="1.5"
          />
          <b-popover :target="assignment.id" triggers="hover focus">
            <template #title
              ><router-link :to="'set-view/' + assignment.set_id">
                {{ assignment.set_id }}</router-link
              ></template
            >
            <table>
              <tbody>
                <tr>
                  <td colspan="2">
                    {{ assignment.type }} date ends at
                    {{ assignment.date.format("hh:mma") }}
                  </td>
                </tr>
                <tr>
                  <td>Visible:</td>
                  <td>{{ getProblemSet(assignment.set_id).visible }}</td>
                </tr>
                <tr>
                  <td>Num. Probs.:</td>
                  <td>
                    {{ getProblemSet(assignment.set_id).problems.length }}
                  </td>
                </tr>
                <tr>
                  <td>Assigned Users:</td>
                  <td>
                    {{
                      getProblemSet(assignment.set_id).assigned_users.length
                    }}/
                    {{ num_users }}
                  </td>
                </tr>
              </tbody>
            </table>
          </b-popover>
        </div>
      </draggable>
    </td>
  </tr>
</template>

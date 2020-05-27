<script lang="ts">
import { Component } from "vue-property-decorator";
import { mixins } from "vue-class-component";

import Draggable, { ChangeEvent } from "vuedraggable";
import dayjs from "dayjs";

import CalendarMixin from "./calendar-mixin";

import { getModule } from "vuex-module-decorators";

import users_module from "@/store/modules/users";
const user_store = getModule(users_module);
import problem_set_module from "@/store/modules/problem_sets";
const problem_set_store = getModule(problem_set_module);

import { AssignmentInfo } from "./calendar-mixin";

@Component({
  name: "CalendarRow",
  components: {
    Draggable,
  },
})
export default class CalendarRow extends mixins(CalendarMixin) {
  // private today: dayjs.Dayjs = dayjs();
  private drag = false;

  private get num_users() {
    return user_store.users.length;
  }

  private getProblemSet(_set_id: string) {
    return problem_set_store.problem_set(_set_id);
  }

  private assignChange(
    new_date: dayjs.Dayjs,
    evt: ChangeEvent<AssignmentInfo>
  ) {
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

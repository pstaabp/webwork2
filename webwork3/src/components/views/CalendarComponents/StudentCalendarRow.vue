<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { mixins } from "vue-class-component";

import CalendarMixin from "./calendar-mixin";

import { BIconBoxArrowUpRight } from "bootstrap-vue";
Vue.component("BIconBoxArrowUpRight", BIconBoxArrowUpRight);

import { login_store } from "@/store";

@Component({
  name: "StudentCalendarRow",
})
export default class StudentCalendarRow extends mixins(CalendarMixin) {
  // determine if the reduced_scoring is enabled and show/hide accordingly.

  private viewAssignment(_set_id: string) {
    this.$router.push({
      name: "student-problem-user-set",
      params: {
        set_id: _set_id,
        user_id: login_store.login_info.user_id,
      },
    });
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
      <div
        v-for="assignment in assignment_info[index]"
        :key="assignment.id"
        :class="show(assignment)"
        class="student-assign border rounded border-dark pl-1 p-0"
      >
        {{ assignment.set_id }}
        <span class="float-right" style="cursor: pointer;">
          <b-icon-box-arrow-up-right
            font-scale="1.25"
            @click="viewAssignment(assignment.set_id)"
          />
        </span>
      </div>
    </td>
  </tr>
</template>

<!-- GatewayInfo.vue

This is a tab within the ProblemSetView that allows the setting of Gateway Quiz parameters. -->

<script lang="ts">
import { Vue, Component, Watch, Prop } from "vue-property-decorator";

import { newProblemSet, parseProblemSet } from "@/common";
import { ProblemSet } from "@/store/models";
import { problem_set_store } from "@/store";

@Component({
  name: "GatewayInfo",
})
export default class GatewayInfo extends Vue {
  @Prop()
  private selected_set!: ProblemSet;

  // store the selected_set as a local copy
  private problem_set: ProblemSet = newProblemSet();

  private save() {
    problem_set_store.updateProblemSet(parseProblemSet(this.problem_set));
  }

  private get proctored(): boolean {
    return this.problem_set.assignment_type === "proctored_gateway";
  }

  @Watch("selected_set", { deep: true })
  private selectedSetChanged(new_set: ProblemSet) {
    if (new_set && new_set.set_id !== this.problem_set.set_id) {
      // the set has changed.
      if (typeof this.problem_set === "undefined") {
        this.problem_set = newProblemSet();
      }
      Object.assign(this.problem_set, this.selected_set);
    }
  }
}
</script>

<template>
  <table
    v-if="problem_set.set_id !== 'XXX'"
    class="table table-sm set-info-table"
  >
    <tbody>
      <tr v-if="proctored">
        <td class="header" style="color: darkblue; font-style: italic;">
          Proctored Gateway/Quiz parameters
        </td>
        <td />
      </tr>
      <tr v-if="proctored">
        <td colspan="2">
          Proctored tests require proctor authorization to start and to grade.
          Provide a password to have a single password for all students to start
          a proctored test.
        </td>
      </tr>
      <tr v-if="proctored">
        <td class="w-50 header">
          Password (Leave blank for regular proctoring)
        </td>
        <td class="w-25">
          <b-input
            v-model="problem_set.pg_password"
            size="sm"
            type="password"
          />
        </td>
      </tr>
      <tr>
        <td class="header">Test Time Limit (min; 0=Due Date)</td>
        <td>
          <b-input
            v-model="problem_set.version_time_limit"
            size="sm"
            type="number"
            @change="save"
          />
        </td>
      </tr>
      <tr>
        <td class="header">Cap Test Time at Set Due Date?</td>
        <td>
          <b-checkbox v-model="problem_set.time_limit_cap" @change="save" />
        </td>
      </tr>
      <tr>
        <td class="header">Number of Graded Submissions per Test (0=infty)</td>
        <td>
          <b-input
            v-model="problem_set.attempts_per_version"
            size="sm"
            type="number"
            @change="save"
          />
        </td>
      </tr>
      <tr>
        <td class="header">
          Time Interval for New Test Versions (min; 0=infty)
        </td>
        <td>
          <b-input
            v-model="problem_set.time_interval"
            size="sm"
            type="number"
            @change="save"
          />
        </td>
      </tr>
      <tr>
        <td class="header">Number of Tests per Time Interval (0=infty)</td>
        <td>
          <b-input
            v-model="problem_set.version_per_interval"
            size="sm"
            type="number"
            @change="save"
          />
        </td>
      </tr>
      <tr>
        <td class="header">Order Problems Randomly</td>
        <td>
          <b-checkbox v-model="problem_set.problem_randorder" @change="save" />
        </td>
      </tr>
      <tr>
        <td class="header">Number of Problems per Page (0=all)</td>
        <td>
          <b-input
            v-model="problem_set.problems_per_page"
            size="sm"
            type="number"
            @change="save"
          />
        </td>
      </tr>
      <tr>
        <td class="header">Show Scores on Finished Assignments?</td>
        <td>
          <b-select v-model="problem_set.hide_score" size="sm" @change="save">
            <option value="Y">Yes</option>
            <option value="N">No</option>
            <option value="BeforeAnswerDate">
              Only After Set Answer Date
            </option>
          </b-select>
        </td>
      </tr>
      <tr>
        <td class="header">Show Problems on Finished Tests?</td>
        <td>
          <b-select v-model="problem_set.hide_work" size="sm" @change="save">
            <option value="N">Yes</option>
            <option value="Y">No</option>
            <option value="BeforeAnswerDate">Only After Set Answer Date</option>
          </b-select>
        </td>
      </tr>
    </tbody>
  </table>
</template>

<style scope>
.header {
  font-weight: bold;
}
table.set-info-table {
  max-width: 800px;
}
</style>

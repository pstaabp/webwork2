<!-- This is the Problem Viewer view.  It acts as the student viewer for viewing and
     submittig problems as well as the professor view for Act As -->

<script lang="ts">
import { Vue, Component, Watch } from "vue-property-decorator";

import dayjs from "dayjs";

import problem_sets_store from "@/store/modules/problem_sets";
import user_store from "@/store/modules/users";
import login_store from "@/store/modules/login";

import ProblemView from "@/components/common_components/ProblemView.vue";

import { fetchUserSets, fetchUserProblem } from "@/store/api";
import { UserProblem, UserSet } from "@/store/models";

import {
  newUserProblem,
  // newUserSet,
  // StringMap,
  hasReducedScoring,
} from "@/common";

@Component({ name: "ProblemViewer", components: { ProblemView } })
export default class ProblemViewer extends Vue {
  private set_id = "";
  private act_as_user_id = "";
  private current_problem_id = 1;
  private user_problem: UserProblem = newUserProblem();
  private user_sets: UserSet[] = [];

  // return an array of problem_sets that the act_as_user is assigned to.
  get valid_problem_sets() {
    const all_set_names = Array.from(problem_sets_store.problem_sets.keys());
    return all_set_names.map((_set_id) => ({
      text: _set_id,
      value: _set_id,
      disabled: this.user_sets.findIndex((_set) => _set.set_id === _set_id) < 0,
    }));
  }

  get problem_set() {
    return problem_sets_store.problem_sets.get(this.set_id);
  }

  get user_set() {
    return this.user_sets.find((_set) => _set.set_id == this.set_id);
  }

  get user_names() {
    return Array.from(user_store.users.keys());
  }

  get num_problems() {
    const set = problem_sets_store.problem_sets.get(this.set_id);
    return (set && set.problems.length) || 0;
  }

  get total_score() {
    return this.user_set && this.user_set.scores
      ? this.user_set.scores.reduce(
          (total, score) => total + parseFloat("" + score.status),
          0
        )
      : 0;
  }

  get max_score() {
    return this.problem_set && this.problem_set.problems
      ? this.problem_set.problems.reduce((total, prob) => total + prob.value, 0)
      : 0;
  }

  private async updateProblem() {
    if (
      typeof this.set_id === "undefined" ||
      this.set_id === "" ||
      typeof this.current_problem_id === "undefined" ||
      this.current_problem_id < 1 ||
      typeof this.act_as_user_id === "undefined" ||
      this.act_as_user_id === ""
    ) {
      return;
    }
    this.user_problem = await fetchUserProblem({
      set_id: this.set_id,
      problem_id: this.current_problem_id,
      user_id: this.act_as_user_id,
    });

    // const res = await renderProblem(this.user_problem);
    // console.log(res); // eslint-disable-line no-console
  }

  @Watch("current_problem_id")
  private currentProblemIDchanged() {
    this.updateProblem();
  }

  @Watch("act_as_user_id")
  private async userIDchanged() {
    if (this.act_as_user_id !== "") {
      this.user_sets = await fetchUserSets({ user_id: this.act_as_user_id });
    }
    // if (this.act_as_user_id === "" || this.set_id === "") {
    //   return;
    // }
    // this.user_set_scores = await fetchUserSetScores({
    //   user_id: this.act_as_user_id,
    //   set_id: this.set_id,
    // });
    this.updateProblem();
  }

  @Watch("set_id")
  private async setNameChanged() {
    if (this.act_as_user_id === "" || this.set_id === "") {
      return;
    }

    this.current_problem_id =
      this.problem_set && this.problem_set.problems.length > 0
        ? this.problem_set.problems[0].problem_id
        : 0;
    this.updateProblem();
  }

  private async mounted() {
    this.act_as_user_id = login_store.login_info.user_id;
    if (this.user_sets.length == 0) {
      this.user_sets = await fetchUserSets({ user_id: this.act_as_user_id });
    }
  }

  private formatDateTime(date: number) {
    return dayjs.unix(date).format("MMM D, YYYY [at] hh:mma");
    //return formatDateTime(date);
  }

  private get has_reduced_scoring() {
    return hasReducedScoring();
  }
}
</script>

<template>
  <b-container>
    <b-row>
      <b-col cols="8">
        <b-container>
          <b-row>
            <b-col cols="6">
              <b-form-group label-cols="4" label="Selected Set">
                <b-select v-model="set_id" :options="valid_problem_sets">
                  <template #first>
                    <b-select-option value="" disabled
                      >Please select a set</b-select-option
                    >
                  </template>
                </b-select>
              </b-form-group>
            </b-col>
            <b-col cols="6">
              <b-form-group label-cols="4" label="Act as User:">
                <b-select v-model="act_as_user_id" :options="user_names" />
              </b-form-group>
            </b-col>
          </b-row>
          <b-row v-if="num_problems > 0">
            <b-pagination
              v-model="current_problem_id"
              :per-page="1"
              :limit="10"
              :total-rows="num_problems"
            />
          </b-row>
          <b-row v-if="num_problems > 0 && set_id">
            <problem-view
              :problem="user_problem"
              :user_id="act_as_user_id"
              type="student"
              class="problem"
            />
          </b-row>
        </b-container>
      </b-col>
      <b-col cols="4">
        <h3>Problem Set Status</h3>
        <table v-if="set_id && user_set" class="table table-sm">
          <tr>
            <td class="header">Set Name:</td>
            <td>{{ set_id.replace(/\_/g, " ") }}</td>
          </tr>
          <tr>
            <td class="header">Open Date:</td>
            <td>{{ formatDateTime(user_set.open_date) }}</td>
          </tr>
          <tr v-if="has_reduced_scoring">
            <td class="header">Red. Scoring Date:</td>
            <td>{{ formatDateTime(user_set.reduced_scoring_date) }}</td>
          </tr>
          <tr>
            <td class="header">Due Date:</td>
            <td>{{ formatDateTime(user_set.due_date) }}</td>
          </tr>
          <tr>
            <td class="header">Answer Date:</td>
            <td>{{ formatDateTime(user_set.answer_date) }}</td>
          </tr>
          <tr>
            <td colspan="2">
              <b-progress :value="total_score" :max="max_score" />
            </td>
          </tr>

          <tr
            v-for="score in user_set.scores"
            :key="'score:' + score.problem_id"
          >
            <td class="header">Problem {{ score.problem_id }}:</td>
            <td>{{ score.status }}</td>
          </tr>
        </table>
      </b-col>
    </b-row>
  </b-container>
</template>

<style scoped>
.problem {
  background-color: rgb(240, 240, 240);
}
</style>

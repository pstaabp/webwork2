<!-- This is the Problem Viewer sidebar.  it has information about the current UserSet
 -->

<script lang="ts">
import { Vue, Component, Prop } from "vue-property-decorator";

import dayjs from "dayjs";

import { getModule } from "vuex-module-decorators";

import problem_set_module from "@/store/modules/problem_sets";
const problem_set_store = getModule(problem_set_module);

import { ScoreType, UserSet, Problem, ProblemSet } from "@/store/models";
import { hasReducedScoring } from "@/common";

@Component({ name: "ProblemViewerSidebar" })
export default class ProblemViewerSidebar extends Vue {
  @Prop() private set_id!: string;
  @Prop() private user_id!: string;
  @Prop() private user_sets_changed!: number;

  private get problem_set(): ProblemSet | undefined {
    return problem_set_store.problem_sets.find(
      (_set) => _set.set_id === this.set_id
    );
  }

  private get user_set(): UserSet | undefined {
    return problem_set_store.user_sets.find(
      (_set) => _set.set_id == this.set_id && _set.user_id == this.user_id
    );
  }

  // private created(): void {
  //   this.$store.subscribe((mutation) => {
  //     // any change to the user set, make sure we have an updated set.
  //     if (mutation.type === "problem_set_module/SET_USER_SET") {
  //       this.updateUserSet();
  //     }
  //   });
  // }

  private get has_reduced_scoring(): boolean {
    return hasReducedScoring();
  }

  private get total_score(): number {
    const probs = (this.problem_set && this.problem_set.problems) || [];

    return this.user_set && this.user_set.scores
      ? this.user_set.scores.reduce(
          (total: number, score: ScoreType, i: number) =>
            total + parseFloat("" + score.status) * probs[i].value,
          0
        )
      : 0;
  }

  private get max_score() {
    // return the total value of all the problems
    return this.problem_set && this.problem_set.problems
      ? this.problem_set.problems.reduce(
          (total: number, prob: Problem) => total + prob.value,
          0
        )
      : 0;
  }

  private formatDateTime(date: number) {
    return dayjs.unix(date).format("MMM D, YYYY [at] hh:mma");
  }

  private problemValue(problem_id: number) {
    const user_set = this.user_set;
    if (user_set) {
      const user_score = user_set.scores.find(
        (_sc: ScoreType) => _sc.problem_id === problem_id
      );
      const problem_value =
        this.problem_set &&
        this.problem_set.problems.find(
          (_prob: Problem) => _prob.problem_id === problem_id
        );
      return (
        (user_score &&
          problem_value &&
          user_score.status * problem_value.value) ||
        0
      );
    } else {
      return 0;
    }
  }
}
</script>
<template>
  <div>
    <h3>Problem Set Status</h3>
    <table v-if="user_set.set_id !== 'XXX'" class="table table-sm">
      <tr>
        <td class="header">Set Name:</td>
        <td>{{ user_set.set_id.replace(/\_/g, " ") }}</td>
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
        :key="'score:' + score.problem_id + ':' + new Date()"
      >
        <td class="header">Problem {{ score.problem_id }}:</td>
        <td>{{ problemValue(score.problem_id) }}</td>
      </tr>
    </table>
  </div>
</template>

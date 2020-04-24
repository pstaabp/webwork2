<script lang="ts">
import { Vue, Component, Prop } from "vue-property-decorator";

import { UserSetScore, ProblemSet, Problem } from "@/store/models";

import app_state from "@/store/modules/app_state";
import users_store from "@/store/modules/users";
import problem_set_store from "@/store/modules/problem_sets";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { round2, StringMap } from "@/common";

interface UserProblemStatus {
  problem_id: number;
  status: number;
}

@Component({
  name: "SelectedUserProgress",
})
export default class SelectedUserProgress extends Vue {
  @Prop()
  private user_set_scores!: UserSetScore[];

  private get selected_set() {
    return app_state.selected_set;
  }

  private get selected_user() {
    return app_state.selected_user;
  }

  private get user() {
    return users_store.users.get(this.selected_user);
  }

  private get full_name() {
    if (!this.user) {
      return "";
    }
    return this.user.first_name + " " + this.user.last_name;
  }

  // figure out the range of problem numbers (problem_id) for all sets:
  private get max_problem_num() {
    return Math.max(
      ...Array.from(problem_set_store.problem_sets.values()).map((_set) => {
        return Math.max(..._set.problems.map((_prob) => _prob.problem_id));
      })
    );
  }

  private get set_scores() {
    if (!(this.user && this.user_set_scores)) {
      return [];
    }

    const max_num = this.max_problem_num;

    const sets = Array.from(problem_set_store.problem_sets.values());
    const user_scores = this.user_set_scores.filter(
      (_set: UserSetScore) => this.user && this.user.user_id === _set.user_id
    );

    // an array from 1 to max_num

    const prob_nums = Array.from(Array(max_num).keys()).map((i) => i + 1);

    return sets.map((_set: ProblemSet) => {
      // get the problem score from the user with set_id _set.set_id
      if (!user_scores) {
        return { set_id: _set.set_id };
      }
      const user_set_score = user_scores.find(
        (_user_set) => _set.set_id === _user_set.set_id
      );
      const scores = user_set_score && user_set_score.scores;

      if (!scores) {
        return [];
      }

      const attrs = {
        set_id: _set.set_id,
        score: scores.map((_sc) => _sc.status).reduce((sum, x) => sum + x, 0),
        max: _set.problems.reduce(
          (sum: number, _prob: Problem) => sum + _prob.value,
          0
        ),
      };

      return prob_nums.reduce((_obj: StringMap, _num: number) => {
        const prob_info = scores.find(
          (_sc: { problem_id: number; status: number }) =>
            _sc.problem_id === _num
        );
        _obj[_num] =
          (prob_info && prob_info.status) ||
          (_set.problems.find((_s) => _s.problem_id == _num) ? "." : "");
        return _obj;
      }, attrs);
    });
  }

  private get fields() {
    // an array from 1 to max_num
    const prob_nums = Array.from(Array(this.max_problem_num).keys()).map(
      (i) => i + 1
    );

    const problems = prob_nums.map((_num) => ({
      key: "" + _num,
      sortable: true,
      formatter: "round2",
    }));

    const fields = [
      { key: "set_id", sortable: true },
      { key: "score", sortable: true, formatter: "round2" },
      { key: "max", sortable: true, formatter: "round2" },
    ];

    return [...fields, ...problems];
  }
}
</script>

<template>
  <b-container>
    <b-row>
      <h4>Student Progress for: {{ full_name }}</h4>
    </b-row>
    <b-row>
      <b-table :items="set_scores" :fields="fields" striped small />
    </b-row>
  </b-container>
</template>

<!-- SelectedSetProgress.vue

This is a tab of the Statistics view for scoring of all users of a selected set. -->

<script lang="ts">
import { Vue, Component, Prop } from "vue-property-decorator";

import { UserSetScore, User, Problem, Dictionary } from "@/store/models";

import app_state from "@/store/modules/app_state";
import users_store from "@/store/modules/users";
import problem_set_store from "@/store/modules/problem_sets";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { round } from "@/common";

interface UserProblemStatus {
  problem_id: number;
  status: number;
}

@Component({
  name: "SelectedSetProgress",
})
export default class SelectedSetProgress extends Vue {
  @Prop()
  private user_set_scores!: UserSetScore[];

  private get selected_set() {
    return app_state.selected_set;
  }

  private get user_scores() {
    const set = problem_set_store.problem_sets.get(this.selected_set);

    if (!set) {
      return [];
    }

    // the following is the all of the user scores for a given set
    const user_sets = this.user_set_scores.filter(
      (_set: UserSetScore) => _set.set_id === this.selected_set
    );

    return users_store.users_array.map((_user: User) => {
      const user_set = user_sets.find((_set) => _set.user_id === _user.user_id);
      if (!user_set) {
        return {};
      }
      const attrs = {
        user_id: _user.user_id,
        first_name: _user.first_name,
        last_name: _user.last_name,
        total_score: user_set.scores
          .map((_sc: UserProblemStatus) => _sc.status)
          .reduce((sum: number, x: number) => sum + x, 0),
      };
      return set.problems.reduce((_obj: Dictionary<string | number>, _prob: Problem) => {
        const prob_info = user_set.scores.find(
          (_sc: UserProblemStatus) => _sc.problem_id === _prob.problem_id
        );
        _obj[_prob.problem_id + ""] = (prob_info && prob_info.status) || 0;
        return _obj;
      }, attrs);
    });
  }

  private get fields() {
    const set = problem_set_store.problem_sets.get(this.selected_set);

    if (!set) {
      return [];
    }
    const problems = set.problems.map((_prob) => ({
      key: "" + _prob.problem_id,
      sortable: true,
      formatter: (value: string | number) =>
        typeof value === "string" ? value : round(value, 2),
    }));

    const fields = [
      { key: "user_id", sortable: true },
      { key: "first_name", sortable: true },
      { key: "last_name", sortable: true },
      {
        key: "total_score",
        sortable: true,
        formatter: (value: string | number) =>
          typeof value === "string" ? value : round(value, 2),
      },
    ];

    return [...fields, ...problems];
  }
}
</script>

<template>
  <b-container>
    <b-row>
      <h4>Student Progress for: {{ selected_set }}</h4>
    </b-row>
    <b-row>
      <b-table :items="user_scores" :fields="fields" striped small />
    </b-row>
  </b-container>
</template>

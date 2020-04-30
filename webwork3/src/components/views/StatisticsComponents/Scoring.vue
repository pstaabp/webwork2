<!-- Scoring.vue

This is the tab of the Statistics view that shows the scoring.  -->

<script lang="ts">
import { Vue, Component, Prop } from "vue-property-decorator";

import { unparse } from "papaparse";

import login_store from "@/store/modules/login";
import users_store from "@/store/modules/users";
import problem_set_store from "@/store/modules/problem_sets";

import { User, UserSetScore, StringMap } from "@/store/models";

// Defintion for problem sets and the total value of the set
interface SetValue {
  set_id: string;
  value: number;
}

interface UserProblemStatus {
  problem_id: number;
  status: number;
}

@Component({
  name: "Scoring",
})
export default class Scoring extends Vue {
  private set_values: SetValue[] = []; // store the value of each set
  private filename = "";
  private all_users = false;
  @Prop()
  private user_set_scores!: UserSetScore[];

  private formatHead(data: { label: string; field: { key: string } }) {
    const sv = this.set_values.find(
      (_sv: SetValue) => _sv.set_id === data.field.key
    );
    return data.label + (sv && sv.value ? " Value: " + sv.value : "");
  }

  private download() {
    const data: StringMap[] = this.user_table;
    // add a row for the max values:
    const row: StringMap = {
      user_id: "MAX value",
      first_name: "",
      last_name: "",
    };
    Object.assign(
      row,
      this.set_values.reduce((obj: StringMap, item: SetValue) => {
        obj[item.set_id] = "" + item.value;
        return obj;
      }, {})
    );
    data.splice(0, 0, row);
    const csv = unparse(data);
    const blob = new Blob([csv], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = this.filename;
    link.click();
    URL.revokeObjectURL(link.href);
    // this.clicked = true;
  }

  private get user_table() {
    let users = users_store.users_array;
    // const sets = problem_set_store.problem_sets;

    // If the all_users checkbox is not selected remove admins/professors and dropped students:
    if (!this.all_users) {
      users = users.filter(
        (_u: User) => _u.permission < 10 && _u.status == "C"
      );
    }

    // take the output from the server (as a list of userset scores) and put the
    // result in a table form to display

    return users.map((_user: User) => {
      // only find user_scores from current user
      const user_scores = this.user_set_scores
        .filter(
          (_set_score: UserSetScore) => _set_score.user_id === _user.user_id
        )
        .map((_set_score: UserSetScore) => ({
          set_id: _set_score.set_id,
          total: (_set_score && this.userProblemsSum(_set_score.scores)) || 0,
        }));

      const user_total = user_scores.reduce(
        (sum: number, item: { set_id: string; total: number }) =>
          sum + item.total,
        0
      );

      return user_scores.reduce(
        (obj: StringMap, item: { set_id: string; total: number }) => {
          obj[item.set_id] = item.total;
          return obj;
        },
        {
          user_id: _user.user_id,
          first_name: _user.first_name,
          last_name: _user.last_name,
          total: user_total,
        }
      );
    });
  }

  private userProblemsSum(arr: UserProblemStatus[]) {
    return arr.reduce((x: number, st: UserProblemStatus) => st.status + x, 0);
  }

  private get fields() {
    // set up the fields property to set the table to be sortable:
    const name_fields = problem_set_store.set_names
      .sort()
      .map((_set_id: string) => ({
        key: _set_id,
        sortable: true,
        formatter: "round2",
      }));
    const info_fields = ["user_id", "first_name", "last_name"].map(
      (_str: string) => ({
        key: _str,
        sortable: true,
        stickyColumn: true,
      })
    );
    return [
      ...info_fields,
      ...name_fields,
      ...[{ key: "total", formatter: "round2", sortable: true }],
    ];
  }

  private mounted() {
    // set the filename
    this.filename = login_store.course_id + "_totals.csv";
  }

  private round2(value: number) {
    return Math.round(100 * value) / 100;
  }
}
</script>

<template>
  <b-container>
    <b-row>
      <b-col cols="2">
        <b-checkbox v-model="all_users">Include All Users </b-checkbox>
      </b-col>
      <b-col>
        <b-form-group
          label-cols="auto"
          label="Export Filename"
          label-for="filename-export"
        >
          <b-input id="filename-export" v-model="filename" />
        </b-form-group>
      </b-col>
      <b-col>
        <b-btn variant="outline-dark" @click="download">Download</b-btn>
      </b-col>
    </b-row>
    <b-row>
      <b-table
        sticky-header="600px"
        :items="user_table"
        :fields="fields"
        striped
        small
        primary_key="user_id"
      >
        <template #head()="data">
          {{ formatHead(data) }}
        </template>
      </b-table>
    </b-row>
  </b-container>
</template>

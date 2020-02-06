<template>
  <b-container>
    <library-subjects
      v-if="tab_name == 'subjects'"
      @load-problems="loadProblems"
    />
    <library-directory
      v-if="tab_name == 'directory'"
      @load-problems="loadProblems"
    />
    <library-textbooks
      v-if="tab_name == 'textbooks'"
      @load-problems="loadProblems"
    />
    <local-library v-if="tab_name == 'local'" @load-problems="loadProblems" />
    <b-row v-if="num_problems > 0" class="mt-2">
      <b-col>
        <b-pagination
          v-model="current_page"
          :total-rows="num_problems"
          :per-page="rows_per_page"
          limit="10"
          size="sm"
        />
      </b-col>
      <b-col>
        {{ current_page }}
      </b-col>
      <!-- <b-col cols="3">
        <b-form-group label="Target Set:" label-size="sm" label-cols="4"
          :state="valid_set_id">
          <b-select size="sm" :options="get_set_ids" v-model="selected_set_id" :state="valid_set_id">
            <template slot="first">
              <option :value="null" disabled>Select a Set</option>
            </template>
          </b-select>
        </b-form-group>
      </b-col>
      <b-col cols="2">
        <b-btn size="sm" variant="outline-dark" :disabled="!valid_set_id" @click="go_to_set">Go to Target Set</b-btn>
      </b-col> -->
    </b-row>
    <b-row>
      <div class="scrollable">
        <problem-view
          v-for="problem in problems"
          :key="problem.problem_id"
          :problem="problem"
          type="library"
          @add-problem="addProblem"
        />
      </div>
    </b-row>
  </b-container>
</template>

<script lang="ts">
import { Vue, Component, Prop } from "vue-property-decorator";

import { Problem, ProblemSet } from "@/store/models";

import login_store from "@/store/modules/login";
import problem_set_store from "@/store/modules/problem_sets";
import app_state from "@/store/modules/app_state";

import LibrarySubjects from "./LibrarySubjects.vue";
import LibraryDirectory from "./LibraryDirectory.vue";
import LibraryTextbooks from "./LibraryTextbooks.vue";
import LocalLibrary from "./LocalLibrary.vue";
import ProblemView from "@/components/common_components/ProblemView.vue";

import Common from "@/common";

@Component({
  name: "LibraryTab",
  components: {
    LibrarySubjects,
    LibraryDirectory,
    LibraryTextbooks,
    ProblemView,
    LocalLibrary
  }
})
export default class LibraryTab extends Vue {
  @Prop()
  private problem_sets!: Map<string, ProblemSet>;
  @Prop()
  private tab_name!: string;

  private all_problems: Problem[] = [];
  private current_page: number = 1;
  private rows_per_page: number = 10;

  private loadProblems(_problems: Problem[]) {
    this.all_problems = _problems;
  }

  private addProblem(_problem: Problem) {
    const _set = this.problem_sets.get(app_state.selected_set);
    if (_set === undefined) {
      return;
    }

    const problem = Common.newProblem();
    problem.source_file = _problem.source_file;
    problem.set_id = _set.set_id;
    problem.problem_id = _set.problems.length + 1;

    _set.problems.push(problem);
    problem_set_store.updateProblemSet(_set);
  }

  private go_to_set() {
    this.$router.push(
      login_store.api_header +
        "/manager/set-details?set_id=" +
        app_state.selected_set
    );
  }

  private valid_set_id() {
    return app_state.selected_set !== undefined;
  }

  private get set_names() {
    return problem_set_store.set_names;
  }

  private get num_problems() {
    return this.all_problems.length;
  }

  private get problems() {
    if (this.all_problems.length === 0 || this.current_page === 0) {
      return [];
    }
    const probs = [];
    for (
      let i = (this.current_page - 1) * this.rows_per_page;
      i <
      Math.min(
        this.all_problems.length,
        this.current_page * this.rows_per_page
      );
      i++
    ) {
      probs.push(this.all_problems[i]);
    }
    return probs;
  }
} // class LibraryTab
</script>

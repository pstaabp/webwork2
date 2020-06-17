<!-- This is the Problem Viewer view.  It acts as the student viewer for viewing and
     submittig problems as well as the professor view for Act As -->

<script lang="ts">
import { Vue, Component, Watch, Prop } from "vue-property-decorator";

import { getModule } from "vuex-module-decorators";

import login_module from "@/store/modules/login";
const login_store = getModule(login_module);
import users_module from "@/store/modules/users";
const user_store = getModule(users_module);
import problem_set_module from "@/store/modules/problem_sets";
const problem_set_store = getModule(problem_set_module);

import ProblemView from "@/components/common_components/ProblemView.vue";
import ProblemViewerSidebar from "./ProblemViewerComponents/ProblemViewerSidebar.vue";

import {
  Problem,
  UserSet,
  ProblemSet,
  UserProblem,
  Dictionary,
} from "@/store/models";

import { newUserProblem } from "@/common";

@Component({
  name: "ProblemViewer",
  components: { ProblemView, ProblemViewerSidebar },
})
export default class ProblemViewer extends Vue {
  @Prop() private viewer_type!: string;
  private set_id = "";
  private user_id = "";
  private current_problem_id = 1;
  private user_sets_changed = 1; // hack to get the user_sets to update.

  // return an array of problem_sets that the act_as_user is assigned to.
  get valid_problem_sets(): Dictionary<string | boolean>[] {
    if (this.user_sets_changed && this.viewer_type === "instructor") {
      return problem_set_store.set_names.map((_set_id: string) => ({
        text: _set_id,
        value: _set_id,
        disabled:
          this.user_sets.findIndex((_set: UserSet) => _set.set_id === _set_id) <
          0,
      }));
    } else if (this.viewer_type === "student") {
      return this.user_sets.map((_set: UserSet) => ({
        text: _set.set_id,
        value: _set.set_id,
      }));
    } else {
      return [];
    }
  }

  get user_problem(): UserProblem {
    const problems = this.user_set ? this.user_set.problems : [];
    const user_problem = newUserProblem();
    const prob = problems.find(
      (_problem: Problem) => _problem.problem_id == this.current_problem_id
    );
    Object.assign(user_problem, prob);
    return user_problem;
  }

  get user_sets(): UserSet[] {
    const sets = problem_set_store.user_sets.filter(
      (_set: UserSet) => _set.user_id === this.user_id
    );
    return this.user_sets_changed ? sets : sets;
  }

  get problem_set(): ProblemSet | undefined {
    return problem_set_store.problem_sets.find(
      (_set) => _set.set_id == this.set_id
    );
  }

  get user_set(): UserSet | undefined {
    const set = problem_set_store.user_sets.find(
      (_set) => _set.user_id === this.user_id && _set.set_id === this.set_id
    );
    return this.user_sets_changed ? set : set;
  }

  get user_names(): string[] {
    return user_store.user_names;
  }

  get num_problems(): number {
    const set = problem_set_store.getUserSet({
      user_id: this.user_id,
      set_id: this.set_id,
    });
    return (set && set.problems && set.problems.length) || 0;
  }

  private async updateSets(): Promise<void> {
    problem_set_store.fetchUserSet({
      user_id: this.user_id,
      set_id: this.set_id,
    });
    this.user_sets_changed++;
  }

  @Watch("user_id")
  private async userIDchanged(): Promise<void> {
    await problem_set_store.fetchUserSets(this.user_id);
    this.user_sets_changed++;
  }

  private async loadUserSet(): Promise<void> {
    if (this.user_id === "" || this.set_id === "") {
      return;
    }
    await problem_set_store.fetchUserSet({
      user_id: this.user_id,
      set_id: this.set_id,
    });

    this.current_problem_id =
      this.user_set && this.user_set.problems.length > 0
        ? this.user_set.problems[0].problem_id
        : 0;
  }

  @Watch("set_id")
  private async setNameChanged(): Promise<void> {
    this.loadUserSet();
  }

  @Watch("$route", { immediate: true, deep: true })
  private async routedChanged(): Promise<void> {
    this.set_id = (this.$route.params && this.$route.params.set_id) || "";
    this.user_id = (this.$route.params && this.$route.params.user_id) || "";
    if (this.user_id) {
      await problem_set_store.fetchUserSets(this.user_id);
      this.user_sets_changed++;
    }
  }

  private async mounted(): Promise<void> {
    this.user_id = login_store.login_info.user_id;
    await problem_set_store.fetchUserSets(this.user_id);
    this.user_sets_changed++;
  }
}
</script>

<template>
  <b-container>
    <b-row>
      <b-col cols="8">
        <b-container>
          <b-row>
            <b-col v-if="viewer_type === 'instructor'" cols="6">
              <b-form-group label-cols="4" label="Act as User:">
                <b-select v-model="user_id" :options="user_names">
                  <template #first>
                    <b-select-option value="" disabled
                      >Please select a user</b-select-option
                    >
                  </template>
                </b-select>
              </b-form-group>
            </b-col>
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
          </b-row>
          <b-row v-if="num_problems > 0 && current_problem_id > 0">
            <b-pagination
              v-model="current_problem_id"
              :per-page="1"
              :limit="10"
              :total-rows="num_problems"
            />
          </b-row>
          <b-row v-if="set_id && num_problems === 0">
            There are no problems in this set.
          </b-row>
          <b-row v-if="num_problems > 0 && set_id">
            <problem-view
              :problem="user_problem"
              :user_id="user_id"
              type="student"
              class="problem"
              @update-sets="updateSets"
            />
          </b-row>
        </b-container>
      </b-col>
      <b-col cols="4">
        <problem-viewer-sidebar
          :set_id="set_id"
          :user_id="user_id"
          :user_sets_changed="user_sets_changed"
        />
      </b-col>
    </b-row>
  </b-container>
</template>

<style scoped>
.problem {
  background-color: rgb(240, 240, 240);
}
</style>

<!-- Statistics.vue

This is the main view for Statistics of user scores and scoring. -->

<script lang="ts">
import { Vue, Component, Watch } from "vue-property-decorator";

import { UserSetScore } from "@/store/models";

import { fetchAllUserSetScores } from "@/store/api";

import ScoringTab from "./StatisticsComponents/Scoring.vue";
import SelectedSetProgress from "./StatisticsComponents/SelectedSetProgress.vue";
import SelectedUserProgress from "./StatisticsComponents/SelectedUserProgress.vue";
import ProblemSetSidebar from "@/components/sidebars/ProblemSetSidebar.vue";
import SelectUserSidebar from "@/components/sidebars/SelectUserSidebar.vue";

@Component({
  name: "Statistics",
  components: {
    ScoringTab,
    SelectedSetProgress,
    SelectedUserProgress,
    ProblemSetSidebar,
    SelectUserSidebar,
  },
})
export default class Statistics extends Vue {
  private user_set_scores: UserSetScore[] = [];
  private show_problem_sets_in_sidebar = true;
  private show_users_in_sidebar = false;
  private tab_index = 0;
  private tabs: {[key: string]: number} = { set: 0, user: 1, export: 2 };
  private user_sidebar = [false, true, false];
  private set_sidebar = [true, false, false];

  private get show_sidebar() {
    return this.show_problem_sets_in_sidebar || this.show_users_in_sidebar;
  }

  private async beforeMount() {
    this.user_set_scores = await fetchAllUserSetScores();
    this.changeTab();
  }

  @Watch("$route", { immediate: true, deep: true })
  private routeChanged() {
    if (this.$route.name === "statistics-tab") {
      this.tab_index = this.tabs[this.$route.params.tabname];
    }
  }

  // update the sidebars
  @Watch("tab_index")
  private changeTab() {
    this.show_users_in_sidebar = this.user_sidebar[this.tab_index];
    this.show_problem_sets_in_sidebar = this.set_sidebar[this.tab_index];
    if (
      this.$route.params.tabname !==
      Array.from(Object.keys(this.tabs))[this.tab_index]
    ) {
      this.$router.push({
        name: "statistics-tab",
        params: { tabname: Array.from(Object.keys(this.tabs))[this.tab_index] },
      });
    }
  }
}
</script>

<template>
  <b-container>
    <b-row>
      <b-col :cols="show_sidebar ? 9 : 12">
        <b-container>
          <b-row v-if="user_set_scores.length == 0">
            <span
              >Loading data...<b-spinner variant="primary" label="Loading"
            /></span>
          </b-row>
          <b-row v-if="user_set_scores.length > 0">
            <b-tabs v-model="tab_index" content-class="mt-3">
              <b-tab title="Progress For Selected Set">
                <selected-set-progress :user_set_scores="user_set_scores" />
              </b-tab>
              <b-tab title="Progress For Selected User" lazy>
                <selected-user-progress :user_set_scores="user_set_scores" />
              </b-tab>
              <b-tab title="Scoring Export" lazy>
                <scoring-tab :user_set_scores="user_set_scores" />
              </b-tab>
            </b-tabs>
          </b-row>
        </b-container>
      </b-col>
      <b-col v-if="show_sidebar" cols="3">
        <b-container>
          <b-row v-if="show_problem_sets_in_sidebar">
            <problem-set-sidebar />
          </b-row>
          <b-row v-if="show_users_in_sidebar">
            <select-user-sidebar />
          </b-row>
        </b-container>
      </b-col>
    </b-row>
  </b-container>
</template>

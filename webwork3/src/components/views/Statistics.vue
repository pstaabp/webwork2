<!-- Statistics.vue

This is the main view for Statistics of user scores and scoring. -->

<script lang="ts">
import { Vue, Component } from "vue-property-decorator";

import { UserSetScore } from "@/store/models";

import { fetchUserSetScores } from "@/store/api";

import ScoringTab from "./StatisticsComponents/Scoring.vue";
import SelectedSetProgress from "./StatisticsComponents/SelectedSetProgress.vue";
import SelectedUserProgress from "./StatisticsComponents/SelectedUserProgress.vue";

import app_state from "@/store/modules/app_state";

@Component({
  name: "Statistics",
  components: {
    ScoringTab,
    SelectedSetProgress,
    SelectedUserProgress,
  },
})
export default class Statistics extends Vue {
  private user_set_scores: UserSetScore[] = [];

  private async mounted() {
    this.user_set_scores = await fetchUserSetScores();
    this.updateInputs(0);
  }

  // update the menubar inputs
  private updateInputs(_new_index: number) {
    switch (_new_index) {
      case 0: // Progress for a given set
        app_state.setShowSetOptions(true);
        app_state.setShowUserOptions(false);
        break;
      case 1: // Progress for a given user
        app_state.setShowSetOptions(false);
        app_state.setShowUserOptions(true);
        break;
      case 2: // export
        app_state.setShowSetOptions(false);
        app_state.setShowUserOptions(false);
        break;
    }
  }
}
</script>

<template>
  <b-container>
    <b-row v-if="user_set_scores.length == 0">
      <span
        >Loading data...<b-spinner variant="primary" label="Loading"
      /></span>
    </b-row>
    <b-row v-if="user_set_scores.length > 0">
      <b-tabs content-class="mt-3" @activate-tab="updateInputs">
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
</template>

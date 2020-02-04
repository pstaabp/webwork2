<template>
  <div class="scrollable">
    <draggable v-model="problems" handle=".drag-handle" :move="reordered">
      <ProblemView
        v-for="problem in problems"
        :key="problem.problem_id"
        :problem="problem"
        type="set"
      />
    </draggable>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Watch, Prop } from "vue-property-decorator";

import ProblemView from "@/components/common_components/ProblemView.vue";
import Draggable from "vuedraggable";

import { ProblemSet, Problem } from "@/store/models";

// set up the store
import problem_sets_store from "@/store/modules/problem_sets";

@Component({
  name: "ProblemListView",
  components: {
    ProblemView,
    Draggable
  }
})
export default class ProblemListView extends Vue {
  @Prop()
  private problem_set!: ProblemSet;

  get problems() {
    return this.problem_set === undefined ? [] : this.problem_set.problems;
  }

  set problems(_problems: Problem[]) {
    this.problem_set.problems = _problems;
  }

  private reordered() {
    console.log("in reordered"); // eslint-disable-line no-console
  }
}
</script>

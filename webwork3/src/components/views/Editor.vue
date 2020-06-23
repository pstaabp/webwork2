<!-- Editor.vue

This is the main component for editing problems. -->

<script lang="ts">
import { Vue, Component, Watch } from "vue-property-decorator";

import "@/components/common_components/mathjax-config";
import "mathjax-full/es5/tex-chtml.js";

// eslint-disable-next-line @typescript-eslint/naming-convention, @typescript-eslint/no-explicit-any
declare let MathJax: any;

import SaveAsProblemModal from "./EditorComponents/SaveAsProblemModal.vue";
import EditorSidebar from "@/components/sidebars/EditorSidebar.vue";
import EditorPane from "./EditorComponents/EditorPane.vue";

import { ProblemSource } from "@/store/models";

@Component({
  name: "Editor",
  components: {
    SaveAsProblemModal,
    EditorSidebar,
    EditorPane,
  },
})
export default class ProblemEditor extends Vue {
  private problem_type = "";
  private selected_set_id = "";
  private selected_problem = 0;
  private tabs = [
    {
      name: "Untitled",
      problem: { problem_path: "", problem_source: "", problem_html: "" },
    },
  ];

  private newProblem(_problem: ProblemSource): void {
    console.log(_problem); // eslint-disable-line no-console
    const file = _problem.problem_path.split("/");
    this.tabs.push({ name: file[file.length - 1], problem: _problem });
  }

  private closeTab(name: string): void {
    const index = this.tabs.findIndex((_tab) => _tab.name === name);
    this.tabs.splice(index, 1);
  }

  @Watch("$route.path", { immediate: true })
  private routedChanged() {
    if (this.$route.name === "editor") {
      console.log(this.$route.params); // eslint-disable-line no-console
      this.newProblem(
        Object.assign(
          { problem_source: "", problem_html: "" },
          { problem_path: this.$route.params.problem_path }
        )
      );
    }
  }
}
</script>

<template>
  <div>
    <b-container>
      <b-row>
        <b-col cols="9">
          <b-tabs content-class="mt-3">
            <editor-pane
              v-for="tab in tabs"
              :key="'tab-' + tab.name"
              :editor_name="tab.name"
              :problem_info="tab.problem"
              @close-tab="closeTab($event)"
            />
          </b-tabs>
        </b-col>
        <b-col cols="3">
          <editor-sidebar @new-problem="newProblem($event)" />
        </b-col>
      </b-row>
    </b-container>
    <save-as-problem-modal />
  </div>
</template>

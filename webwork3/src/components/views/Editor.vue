<!-- Editor.vue

This is the main component for editing problems. -->

<script lang="ts">
import { Vue, Component, Watch } from "vue-property-decorator";
import axios from "axios";
// import * as CodeMirror from "codemirror";
// import "codemirror/mode/perl/perl.js";
// import "codemirror/lib/codemirror.css";

import SaveAsProblemModal from "./EditorComponents/SaveAsProblemModal.vue";

import { Problem } from "@/store/models";

import { renderFromSource, fetchProblemSource } from "@/store/api";

import { getModule } from "vuex-module-decorators";

import login_module from "@/store/modules/login";
const login_store = getModule(login_module);
import problem_set_module from "@/store/modules/problem_sets";
const problem_set_store = getModule(problem_set_module);

@Component({
  name: "Editor",
  components: {
    SaveAsProblemModal,
  },
})
export default class ProblemEditor extends Vue {
  private problem_type = "";
  private selected_set_id = "";
  private selected_problem = 0;
  private problem_source = "var x = 5;";
  private problem_path = "";
  private problem_html = "";
  private cm!: any; // eslint-disable-line @typescript-eslint/no-explicit-any

  private get set_names() {
    return [
      ...[{ value: "", text: "Select Set" }],
      ...problem_set_store.set_names.map((_set_id: string) => ({
        value: _set_id,
        text: _set_id,
      })),
    ];
  }

  private get problems() {
    const set = problem_set_store.problem_set(this.selected_set_id);
    return set
      ? [
          ...[{ value: "", text: "Select Problem" }],
          ...set.problems.map((_prob) => ({
            value: _prob.problem_id,
            text: _prob.problem_id,
          })),
        ]
      : [];
  }

  private get editable() {
    console.log(/^Library/.test(this.problem_path)); // eslint-disable-line no-console
    return !/^Library/.test(this.problem_path);
  }

  private updateSource() {
    const set = problem_set_store.problem_set(this.selected_set_id);
    if (set) {
      const prob = set.problems.find(
        (prob: Problem) => prob.problem_id === this.selected_problem
      );
      if (prob) {
        this.problem_path = prob.source_file;
        axios
          .get(login_store.api_header + "/library/fullproblem", {
            params: prob,
          })
          .then((response) => {
            this.problem_source = response.data.problem_source;
            this.cm.setValue(this.problem_source);
          });
      }
    }
  }

  private async renderProblem() {
    const results = await renderFromSource(this.cm.getValue());
    console.log(results); // eslint-disable-line no-console
    this.problem_html = results.text;

    setTimeout(() => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
      // @ts-ignore eslint-disable-line
      MathJax.typeset(); // eslint-disable-line no-undef
    }, 500);
  }

  private async fetchProblemSource(problem: Problem) {
    const prob = await fetchProblemSource(problem.source_file);
    this.cm.setValue(prob.problem_source as string);
  }

  private startUpCodeMirror() {
    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore
    const config: window.CodeMirror.EditorConfiguration = {
      tabSize: 2,
      lineNumbers: true,
      mode: "perl",
    };
    const text_area = document.getElementById("source") as HTMLTextAreaElement;
    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore
    this.cm = window.CodeMirror.fromTextArea(text_area, config);
    this.cm.setValue(this.problem_source);

    console.log(this.cm); // eslint-disable-line no-console
  }

  private mounted() {
    // this dynamically loads in CodeMirror, which is a large library.
    // TODO:  look into CM 6, which seems to be smaller
    // TODO: also look into lazy-loading of modules via webpack.

    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore
    if (!window.CodeMirror) {
      const script_tag = document.createElement("script");
      script_tag.src =
        "https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.53.2/codemirror.min.js";
      document.getElementsByTagName("head")[0].appendChild(script_tag);

      const link_tag = document.createElement("link");
      link_tag.rel = "stylesheet";
      link_tag.href =
        "https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.53.2/codemirror.min.css";
      document.getElementsByTagName("head")[0].appendChild(link_tag);

      const perl_script_tag = document.createElement("script");
      perl_script_tag.src =
        "https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.53.2/mode/perl/perl.min.js";
      document.getElementsByTagName("head")[0].appendChild(perl_script_tag);
      setTimeout(() => this.startUpCodeMirror(), 500);
    } else {
      this.startUpCodeMirror();
    }
  }

  @Watch("$route.path", { immediate: true })
  private routeChanged() {
    if (this.$route.name === "editor") {
      if (this.$route.params.problem) {
        const problem = (this.$route.params.problem as unknown) as Problem;
        this.fetchProblemSource(problem);
        this.problem_path = problem.source_file;
      }
    }
  }

  private updated() {
    // MathJax.Hub.Queue(['Typeset', MathJax.Hub]);
  }
}
</script>

<template>
  <div>
    <b-container>
      <b-row>
        <b-col cols="3">
          <b-form-group label="Select from" label-cols="6">
            <b-select v-model="problem_type" size="sm">
              <option value=""><em>Select...</em></option>
              <option value="set">Existing Set</option>
              <option value="library">Problem Library</option>
              <option value="template">From Template</option>
            </b-select>
          </b-form-group>
        </b-col>
        <b-col v-if="problem_type == 'set'" cols="3">
          <b-form-group label="Set Name:" label-cols="4">
            <b-select
              v-model="selected_set_id"
              size="sm"
              :options="set_names"
            />
          </b-form-group>
        </b-col>
        <b-col v-if="problem_type == 'set'" cols="3">
          <b-form-group label="Problem:" label-cols="4">
            <b-select
              v-model="selected_problem"
              size="sm"
              :options="problems"
              @change="updateSource"
            />
          </b-form-group>
        </b-col>
        <b-col>
          <b-btn
            v-b-modal.save-as-problem-modal
            size="sm"
            variant="outline-dark"
          >
            Save Problem As...
          </b-btn>
        </b-col>
      </b-row>
      <b-row>
        <b-tabs content-class="mt-3">
          <b-tab title="Problem Source" active>
            <div v-if="!editable" class="text-danger">
              This problem is from the library and is read-only. Please select
              "Save As..." to create a local, editable copy.
            </div>
            <textarea id="source" rows="10" />
          </b-tab>
          <b-tab title="Rendered Problem" @click="renderProblem">
            <!-- eslint-disable-next-line vue/no-v-html -->
            <div v-html="problem_html" />
          </b-tab>
        </b-tabs>
      </b-row>
    </b-container>
    <save-as-problem-modal />
  </div>
</template>

<style scoped>
#source {
  border: 1px solid black;
  width: 100%;
}
</style>

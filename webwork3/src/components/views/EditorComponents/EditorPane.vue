<!-- Editor.vue

This is the main component for editing problems. -->

<script lang="ts">
import { Vue, Component, Prop } from "vue-property-decorator";
// import axios from "axios";

// declare function CodeMirror(host: HTMLElement, options?: CodeMirror.EditorConfiguration): CodeMirror.Editor;

import * as CodeMirror from "codemirror";
import "codemirror/mode/perl/perl.js";
import "codemirror/lib/codemirror.css";

import "@/components/common_components/mathjax-config";
import "mathjax-full/es5/tex-chtml.js";

// eslint-disable-next-line @typescript-eslint/naming-convention, @typescript-eslint/no-explicit-any
declare let MathJax: any;

import { renderFromSource, fetchProblemSource } from "@/store/api";

import { ProblemSource } from "@/store/models";

@Component({ name: "EditorPane" })
export default class ProblemEditor extends Vue {
  @Prop() private editor_name!: string;
  @Prop() private problem_info!: ProblemSource;
  private problem_html = "";

  private cm!: any; // eslint-disable-line @typescript-eslint/no-explicit-any

  private get editable() {
    return !/^[/templates|Library]/.test(this.problem_info.problem_path);
  }

  private closeTab(): void {
    // check to make sure that the file is saved.
    this.$emit("close-tab", this.editor_name);
  }

  private async renderProblem(): Promise<void> {
    const response = await renderFromSource(this.cm.getValue());
    this.problem_html = response.text;

    Promise.resolve()
      .then(() => {
        MathJax.typesetPromise();
      })
      .catch((e) => console.log(e));
  }

  private async mounted(): Promise<void> {
    // console.log(CodeMirror); // eslint-disable-line no-console
    const config: CodeMirror.EditorConfiguration = {
      tabSize: 2,
      lineNumbers: true,
      mode: "perl",
    };
    const div = document.getElementById(
      "source-" + this.editor_name
    ) as HTMLDivElement;
    this.cm = CodeMirror(div, config);
    if (!this.problem_info.problem_source) {
      // it needs to be loaded:
      const response = await fetchProblemSource(this.problem_info.problem_path);
      this.problem_info.problem_source = response.problem_source;
    }
    this.cm.setValue(this.problem_info.problem_source);
  }
}
</script>

<template>
  <b-tab>
    <template #title>
      {{ editor_name }}
      <b-btn size="sm" variant="primary" class="p-0" @click="closeTab"
        ><b-icon-x
      /></b-btn>
    </template>
    <b-container>
      <b-row v-if="!editable" class="text-danger">
        This problem is read-only. Please select "Save As..." to create a local,
        editable copy.
      </b-row>
      <b-row>
        <b-col cols="9">Problem Path: {{ problem_info.problem_path }}</b-col>
        <b-col cols="3"
          ><b-btn variant="outline-dark" size="sm"
            >Save Problem As...</b-btn
          ></b-col
        >
      </b-row>
      <b-row>
        <b-tabs card pills end style="width: 100%;">
          <b-tab title="source">
            <div :id="'source-' + editor_name" class="cm-editor" />
          </b-tab>
          <b-tab title="rendered" @click="renderProblem">
            <!-- eslint-disable-next-line vue/no-v-html -->
            <div v-html="problem_html" />
          </b-tab>
        </b-tabs>
      </b-row>
    </b-container>
  </b-tab>
</template>

<style scoped>
.CodeMirror {
  height: 100%;
}
.cm-editor {
  border: 1px solid black;
  /* width: 100%;
  height: 400px; */
}
</style>

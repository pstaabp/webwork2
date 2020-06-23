<!-- EditorSidebar.vue

This is the Sidebar to allow changes the Problem Editor. -->

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

import { fetchProblemTemplate, fetchProblemSource } from "@/store/api";
import { problem_set_store } from "@/store";

import { Problem } from "@/store/models";

@Component({ name: "EditorSidebar" })
export default class EditorSidebar extends Vue {
  private set_id = "";
  private problem_type = "";
  private problem_id = -1;
  private problem_path = "";
  private template_type = "";

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
    const set = problem_set_store.problem_sets.find(
      (_set) => _set.set_id === this.set_id
    );
    // console.log(set); // eslint-disable-line no-console
    return set
      ? [
          ...[{ value: -1, text: "Select Problem", disabled: true }],
          ...set.problems.map((_prob) => ({
            value: _prob.problem_id,
            text: _prob.problem_id,
          })),
        ]
      : [];
  }

  private async updateSource(): Promise<void> {
    const set = await problem_set_store.getProblemSet(this.set_id);
    if (set) {
      const prob = set.problems.find(
        (prob: Problem) => prob.problem_id === this.problem_id
      );
      if (prob) {
        this.problem_path = prob.source_file;
        const response = await fetchProblemSource(prob.source_file);

        this.$emit(
          "new-problem",
          Object.assign({ problem_path: this.problem_path }, response)
        );
      }
    }
  }

  private async fetchTemplate(): Promise<void> {
    const response = await fetchProblemTemplate(this.template_type);
    this.$emit(
      "new-problem",
      Object.assign(response, {
        problem_path: "/templates/" + this.template_type + "_template.pg",
      })
    );
  }
}
</script>
<template>
  <b-container>
    <h3>Editor Sidebar</h3>

    <b-row>
      <b-dd text="Select Problem from ...">
        <b-dd-item @click="problem_type = 'set'">Existing Set </b-dd-item>
        <b-dd-item @click="problem_type = 'library'"
          >Problem Library
        </b-dd-item>
        <b-dd-item @click="problem_type = 'template'">Template</b-dd-item>
      </b-dd>
    </b-row>
    <b-row v-if="problem_type === 'set'">
      <b-form-group label="Set Name:">
        <b-select v-model="set_id" size="sm" :options="set_names" />
      </b-form-group>
    </b-row>
    <b-row v-if="problems && problem_type === 'set'">
      <b-form-group label="Problem:">
        <b-select
          v-model="problem_id"
          size="sm"
          :options="problems"
          @change="updateSource"
        />
      </b-form-group>
    </b-row>
    <b-row v-if="problem_type === 'template'">
      <b-form-group label="Template type:">
        <b-select v-model="template_type" size="sm" @change="fetchTemplate">
          <option value="" disabled>Select Template</option>
          <option value="pg">PG template</option>
          <option value="pgml">PGML template</option>
        </b-select>
      </b-form-group>
    </b-row>
    <!-- <b-col>
      <b-btn v-b-modal.save-as-problem-modal size="sm" variant="outline-dark">
        Save Problem As...
      </b-btn>
    </b-col> -->
  </b-container>
</template>

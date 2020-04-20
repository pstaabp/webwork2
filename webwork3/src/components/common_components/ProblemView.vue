<script lang="ts">
/* eslint-disable */
// @ts-nocheck
import { Vue, Component, Watch, Prop } from "vue-property-decorator";

import { fetchProblem, fetchProblemTags } from "@/store/api";
import login_module from "@/store/modules/login";

import { ProblemViewOptions, LIB_PROB, SET_PROB } from "@/common";

import { Problem } from "@/store/models";

@Component({
  name: "ProblemView", // name of the view
})
export default class ProblemView extends Vue {
  private html = "";
  private show_tags = false;
  private show_path = false;
  private tags = {};

  @Prop() private problem!: Problem;
  @Prop() private type!: string;

  public mounted() {
    this.fetch({});
  }

  private get tags_loaded() {
    return Object.keys(this.tags).length > 0;
  }

  private async fetch(other_params: StringMap){
    const problem = await fetchProblem(Object.assign({}, this.problem, other_params));
    this.html = problem.text;
    window.MathJax.typeset();
  }

  get prop(): ProblemViewOptions {
    return this.type === "library" ? LIB_PROB : SET_PROB;
  }

  private addProblem(evt: Event): void {
    console.log(evt); // eslint-disable-line no-console
  }

  private randomize(): void {
    this.fetchProblem({ problem_seed: Math.floor(10000 * Math.random()) });
  }

  @Watch("problem")
  private problemChange(): void {
    console.log("in problem changed"); // eslint-disable-line no-console
    this.fetch();
  }

  @Watch("show_tags")
  private async showTagsChanged() {
    if (!this.tags_loaded) { // the tags object is empty
      this.tags = await fetchProblemTags(this.problem.source_file);
    }
  }

  private edit(){
    console.log("in edit"); // eslint-disable-line no-console
    this.$router.push({name: "editor", params: {problem: this.problem}});
  }

}
</script>

<template>
  <li class="problem p-2 rounded">
    <b-container>
      <b-row>
        <b-col cols="6">
          <b-row>
            <b-col v-if="prop.numbered" cols="2">
              <b-input-group size="sm">
                <span class="problem-id">{{ problem.problem_id }}</span>
              </b-input-group>
            </b-col>
            <b-col v-if="prop.value" cols="4">
              <b-input-group size="sm">
                <template #prepend>
                  <b-input-group-text>Value:</b-input-group-text>
                </template>
                <b-input v-model="problem.value" type="number" />
              </b-input-group>
            </b-col>
            <b-col v-if="prop.attempts" cols="4">
              <b-input-group size="sm" prepend="Max. Att.:">
                <b-input v-model="problem.max_attempts" type="number" />
              </b-input-group>
            </b-col>
          </b-row>
        </b-col>
        <b-col cols="5">
          <b-btn-toolbar>
            <b-btn-group size="sm">
              <b-btn
                v-if="prop.add"
                variant="outline-dark"
                title="add problem"
                @click="$emit('add-problem', problem)"
              >
                <b-icon icon="plus" />
              </b-btn>
              <b-btn
                v-if="prop.edit"
                variant="outline-dark"
                title="edit"
                @click="edit"
              >
                <b-icon icon="pencil" />
              </b-btn>
              <b-btn
                v-if="prop.randomize"
                variant="outline-dark"
                title="randomize"
                @click="randomize"
              >
                <b-icon icon="arrow-clockwise" />
              </b-btn>
              <b-btn
                v-if="prop.delete"
                variant="outline-dark"
                title="delete problem"
              >
                <b-icon icon="trash" />
              </b-btn>
              <b-btn
                v-if="prop.mark_all"
                variant="outline-dark"
                title="Mark this problem correct for all assigned users."
                disabled
              >
                <b-icon icon="check" />
              </b-btn>
              <b-btn
                v-if="prop.tags"
                :variant="show_tags? 'success' : 'outline-dark'"
                @click="show_tags = ! show_tags"
                title="show/hide tags"
              >
                <b-icon icon="tag" />
              </b-btn>
              <b-btn
                v-if="prop.path"
                :variant="show_path ? 'success' : 'outline-dark'"
                title="show/hide path"
                @click="show_path = !show_path"
              >
                <b-icon icon="folder" />
              </b-btn>
              <b-btn
                v-if="prop.target_set"
                variant="outline-dark"
                title="This problem is in the target set."
              >
                <b-icon icon="bullseye" />
              </b-btn>
            </b-btn-group>
          </b-btn-toolbar>
        </b-col>
        <b-col cols="1">
          <b-btn-group v-if="prop.reorder" size="sm" class="float-right">
            <b-btn
              class="drag-handle border border-dark rounded p-2"
              variant="outline-dark"
            >
              <b-icon icon="arrow-up-down" />
            </b-btn>
          </b-btn-group>
        </b-col>
      </b-row>
      <b-row v-if="show_path"> Path: {{ problem.source_file }} </b-row>
      <b-row v-if="show_tags && tags_loaded">
        <table class="table table-sm table-bordered">
          <tr>
            <td class="header">DBsubject:</td><td>{{tags.DBsubject}}</td>
            <td class="header">DBchapter:</td><td>{{tags.DBchapter}}</td>
            <td class="header">DBsection:</td><td>{{tags.DBsection}}</td>
          </tr>
          <tr>
            <td class="header">Author:</td><td>{{tags.Author}}</td>
            <td class="header">Institution:</td><td>{{tags.Institution}}</td>
            <td class="header">Date:</td><td>{{tags.Date}}</td>
          </tr>
          <tr>
            <td class="header">Level:</td><td>{{tags.Level}}</td>
            <td class="header">MLT:</td><td>{{tags.MLT}}</td>
            <td class="header">MLTleader:</td><td>{{tags.MLTleader}}</td>
          </tr>
          <tr>
            <td class="header">keywords:</td><td colspan="5">{{tags.keywords.join(", ")}}</td>
          </tr>
          <tr>
            <td class="header">Language:</td><td>{{tags.Language}}</td>
            <td class="header">Status:</td><td>{{tags.Status}}</td>
            <td class="header">isPlaceholder:</td><td>{{tags.isPlaceholder}}</td>
          </tr>
          <tr>
            <td class="header">MO:</td><td>{{tags.MO}}</td>
            <td class="header">lasttagline:</td><td>{{tags.lasttagline}}</td>
            <td class="header">static:</td><td>{{tags.static}}</td>
          </tr>
          <tr>
            <td class="header">modified:</td><td>{{tags.modified}}</td>
            <td class="header">resources:</td><td colspan="3">{{tags.resources.join(", ")}}</td>
          </tr>
          <tr><td class="header" colspan="6">Textbook Info</td></tr>
          <template v-for="textbook in tags.textinfo">
            <tr>
              <td class="header">TitleText:</td><td>{{textbook.TitleText}}</td>
              <td class="header">AuthorText:</td><td>{{textbook.AuthorText}}</td>
              <td class="header">EditionText:</td><td>{{textbook.EditionText}}</td>
            </tr>
            <tr>
              <td class="header">chapter:</td><td>{{textbook.chapter}}</td>
              <td class="header">section:</td><td>{{textbook.section}}</td>
              <td class="header">problems:</td><td>{{textbook.problems}}</td>
            </tr>
          </template>
        </table>
      </b-row>
      <b-row>
        <div v-if="html == ''" class="text-center">
          <b-spinner variant="info" />
        </div>
        <div v-else class="problem-tag-container">
          <div id="problem-output" v-html="html"/>
        </div>
      </b-row>
    </b-container>
  </li>
</template>

<style>
.header {
  font-weight: bold;
}
.problem {
  list-style: none;
  border: 1px black solid;
  width: 100%;
}
.problem-id {
  font-weight: bold;
  font-size: 120%;
  padding-right: 1ex;
}
</style>

<script lang="ts">
import { Vue, Component, Watch, Prop } from "vue-property-decorator";

import { ProblemTags } from "@/store/models";

@Component({
  name: "ProblemTagsView", // name of the view
})
export default class ProblemTagsView extends Vue {
  @Prop() private problem_tags!: ProblemTags;
}
</script>

<template>
  <table class="table table-sm table-bordered">
    <tr>
      <td class="header">DBsubject:</td>
      <td>{{ tags.DBsubject }}</td>
      <td class="header">DBchapter:</td>
      <td>{{ tags.DBchapter }}</td>
      <td class="header">DBsection:</td>
      <td>{{ tags.DBsection }}</td>
    </tr>
    <tr>
      <td class="header">Author:</td>
      <td>{{ tags.Author }}</td>
      <td class="header">Institution:</td>
      <td>{{ tags.Institution }}</td>
      <td class="header">Date:</td>
      <td>{{ tags.Date }}</td>
    </tr>
    <tr>
      <td class="header">Level:</td>
      <td>{{ tags.Level }}</td>
      <td class="header">MLT:</td>
      <td>{{ tags.MLT }}</td>
      <td class="header">MLTleader:</td>
      <td>{{ tags.MLTleader }}</td>
    </tr>
    <tr>
      <td class="header">keywords:</td>
      <td colspan="5">{{ tags.keywords.join(", ") }}</td>
    </tr>
    <tr>
      <td class="header">Language:</td>
      <td>{{ tags.Language }}</td>
      <td class="header">Status:</td>
      <td>{{ tags.Status }}</td>
      <td class="header">isPlaceholder:</td>
      <td>{{ tags.isPlaceholder }}</td>
    </tr>
    <tr>
      <td class="header">MO:</td>
      <td>{{ tags.MO }}</td>
      <td class="header">lasttagline:</td>
      <td>{{ tags.lasttagline }}</td>
      <td class="header">static:</td>
      <td>{{ tags.static }}</td>
    </tr>
    <tr>
      <td class="header">modified:</td>
      <td>{{ tags.modified }}</td>
      <td class="header">resources:</td>
      <td colspan="3">{{ tags.resources.join(", ") }}</td>
    </tr>
    <tr>
      <td class="header" colspan="6">Textbook Info</td>
    </tr>
    <template v-for="textbook in tags.textinfo">
      <tr :key="'row1:' + textbook.TitleText">
        <td class="header">TitleText:</td>
        <td>{{ textbook.TitleText }}</td>
        <td class="header">AuthorText:</td>
        <td>{{ textbook.AuthorText }}</td>
        <td class="header">EditionText:</td>
        <td>{{ textbook.EditionText }}</td>
      </tr>
      <tr :key="'row2:' + textbook.TitleText">
        <td class="header">chapter:</td>
        <td>{{ textbook.chapter }}</td>
        <td class="header">section:</td>
        <td>{{ textbook.section }}</td>
        <td class="header">problems:</td>
        <td>{{ textbook.problems }}</td>
      </tr>
    </template>
  </table>
</template>

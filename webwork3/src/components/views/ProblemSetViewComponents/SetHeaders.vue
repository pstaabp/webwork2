<!-- SetHeaders.vue

This is a tab within the ProblemSetView that allows the viewing/editing of the set headers. -->

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { ProblemSet } from "@/store/models";


@Component({
  name: "SetHeaders",
})
export default class AssignUsers extends Vue {
  private description = "";
}
</script>

<template>
<b-container>
  <b-row>
    <b-col cols="2">
      <b>Set Description</b>
    </b-col>
    <b-col>
      <b-textarea v-model="description" rows="10"
      max-rows="20"/>
    </b-col>
  </b-row>
</b-container>
</template>

<!-- SetHeaders.vue

This is a tab within the ProblemSetView that allows the viewing/editing of the set headers. -->

<script lang="ts">
import { Component, Vue, Prop, Watch } from "vue-property-decorator";
import { ProblemSet } from "@/store/models";

import { getModule } from "vuex-module-decorators";

import login_module from "@/store/modules/login";
const login_store = getModule(login_module);

import axios from "axios";

@Component({
  name: "SetHeaders",
})
export default class SetHeaders extends Vue {
  @Prop() private problem_set!: ProblemSet;
  private headers: string[] = [];
  private screen_header = "";
  private screen_header_content = "";
  private hardcopy_header = "";
  private hardcopy_header_content = "";

  private async beforeMount() {
    const response = await axios.get(login_store.api_header + "/headers");
    this.headers = response.data as string[];
    this.screen_header = this.problem_set.set_header;
    this.hardcopy_header = this.problem_set.hardcopy_header;
  }

  @Watch("screen_header")
  private async screenHeaderChanged() {
    const response = await axios.get(
      login_store.api_header +
        "/sets/" +
        this.problem_set.set_id +
        "/header/" +
        (this.screen_header || "defaultHeader")
    );
    console.log(response.data); // eslint-disable-line no-console
    this.screen_header_content = response.data.header_content;
  }
}
</script>

<template>
  <b-container>
    <b-tabs pills>
      <b-tab title="Set Description">
        <b-textarea v-model="problem_set.description" rows="10" max-rows="20" />
      </b-tab>
      <b-tab title="Set Header">
        <b-container class="pt-3">
          <b-row>
            <b-form-group label-cols="4" label="Screen Header File">
              <b-select v-model="screen_header" :options="headers" />
            </b-form-group>
          </b-row>
          <b-row>
            <b-textarea :value="screen_header_content" rows="15" />
          </b-row>
        </b-container>
      </b-tab>
      <b-tab title="Hard Copy Header">
        <h2>Hard Copy Header</h2>
      </b-tab>
    </b-tabs>
  </b-container>
</template>

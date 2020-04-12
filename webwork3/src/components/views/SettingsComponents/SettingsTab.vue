<!-- SettingsTab.vue

This is the basic component for an individual settings tab. -->

<script lang="ts">
import { Vue, Component, Prop, Watch } from "vue-property-decorator";

import { Setting } from "@/store/models";

import SettingsRow from "./SettingsRow.vue";

@Component({
  name: "SettingsTab",
  components: {
    SettingsRow,
  },
})
export default class SettingsTab extends Vue {
  @Prop() public name!: string;
  @Prop() public settings!: Setting[];

}
</script>

<template>
  <div>
    <table class="table table-sm bordered">
      <settings-row
        v-for="setting in settings"
        :key="setting.var"
        :var="setting.var"
      />
    </table>
  </div>
</template>

<template>
  <div>
    <table class="table table-sm bordered">
      <settings-row
        v-for="setting in settings"
        :setting="setting"
        :key="setting.var + new Date()"
      />
    </table>
  </div>
</template>

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

  @Watch("settings")
  private settingsChanged() {
    console.log("settings changed in settingsTab"); // eslint-disable-line no-console
  }
}
</script>

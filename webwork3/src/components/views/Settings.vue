<template>
  <b-container>
    <b-tabs content-class="mt-3">
      <b-tab title="General" active lazy>
        <settings-tab name="General" :settings="filterSettings('General')" />
      </b-tab>
      <b-tab title="Optional Modules">
        <settings-tab
          name="Optional Modules"
          :settings="filterSettings('Optional Modules')"
        />
      </b-tab>
      <b-tab title="Permissions" lazy>
        <settings-tab
          name="Permissions"
          :settings="filterSettings('Permissions')"
        />
      </b-tab>
      <b-tab title="Problem Display" lazy>
        <settings-tab
          name="Problem Display"
          :settings="filterSettings('PG - Problem Display/Answer Checking')"
        />
      </b-tab>
      <b-tab title="Email" lazy>
        <settings-tab
          name="Permissions"
          :settings="filterSettings('Permissions')"
        />
      </b-tab>
      <b-tab title="Editor" lazy>
        <settings-tab name="Editor" :settings="filterSettings('Editor')" />
      </b-tab>
      <b-tab title="WW3-UI">
        <settings-tab name="WW3-UI" :settings="filterSettings('WW3-UI')" />
      </b-tab>
    </b-tabs>
  </b-container>
</template>

<script lang="ts">
import { Vue, Component } from "vue-property-decorator";

import SettingsTab from "./SettingsComponents/SettingsTab.vue";

import { Setting } from "@/store/models";

// set up the store
import settings_store from "@/store/modules/settings";

@Component({
  name: "Settings",
  components: {
    SettingsTab,
  },
})
export default class Settings extends Vue {
  private settings_change = 1;

  private get settings() {
    return this.settings_change && settings_store.settings_array;
  }
  private filterSettings(category: string): Setting[] {
    return this.settings.filter(
      (setting: Setting) => setting.category === category
    );
  }

  private mounted() {
    this.$store.subscribe((mutation, state) => {
      // any change to the settings
      if (mutation.type === "settings/SET_SETTING") {
        console.log("setting changed!"); // eslint-disable-line no-console
        this.settings_change += 1;
      }
    });
  }
}
</script>

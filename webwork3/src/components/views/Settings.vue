<!-- Settings.vue

This is the main view for viewing/editing settings for the course. -->

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

  private get settings() {
      return settings_store.settings_array;
  }
  private filterSettings(category: string): Setting[] {
    return this.settings.filter(
      (setting: Setting) => setting.category === category
    );
  }

}
</script>

<template>
  <b-container>
    <b-tabs content-class="mt-3">
      <b-tab title="General" active lazy>
        <settings-tab name="General" :settings="filterSettings('General')" />
      </b-tab>
      <b-tab title="Optional Modules" lazy>
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
      <b-tab title="WW3-UI" lazy>
        <settings-tab name="WW3-UI" :settings="filterSettings('WW3-UI')" />
      </b-tab>
    </b-tabs>
  </b-container>
</template>

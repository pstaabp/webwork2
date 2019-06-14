<template>
  <b-container>
    <b-tabs content-class="mt-3">
      <b-tab title="General" active>
        <settings-tab name="General" :settings="filterSettings('General')" /></b-tab>
      <b-tab title="Optional Modules">
        <settings-tab name="Optional Modules" :settings="filterSettings('Optional Modules')" /></b-tab>
      <b-tab title="Permissions">
        <settings-tab name="Permissions" :settings="filterSettings('Permissions')" /></b-tab>
      <b-tab title="Problem Display">
        <settings-tab name="Problem Display" :settings="filterSettings('PG - Problem Display/Answer Checking')" /></b-tab>
      <b-tab title="Email">
        <settings-tab name="Permissions" :settings="filterSettings('Permissions')" /></b-tab>
      <b-tab title="Editor">
        <settings-tab name="Editor" :settings="filterSettings('Editor')" /></b-tab>
      <b-tab title="WW3-UI">
        <settings-tab name="WW3-UI" :settings="filterSettings('WW3-UI')" /></b-tab>
    </b-tabs>
  </b-container>
</template>


<script>
import SettingsTab from './SettingsComponents/SettingsTab.vue'

export default {
  name: 'Settings',
  components: {
    SettingsTab
  },
  methods: {
    filterSettings(_cat) {
      return this.$store.state.settings.filter(setting =>  setting.category == _cat);
    }
  }
}
</script>

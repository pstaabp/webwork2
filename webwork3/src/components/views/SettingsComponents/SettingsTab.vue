<template>
  <div>
    <table class="table table-sm bordered">
      <settings-row  v-for="setting in settings" :setting="setting" :key="setting.var"/>
    </table>
  </div>
</template>


<script>
import SettingsRow from './SettingsRow';

export default {
  name: 'SettingsTab',
  props: {
    name: String,
    settings: Array,
  },
  components: {
    SettingsRow,
  },
};

</script>

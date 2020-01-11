<template>
  <div>
    <table class="table table-sm bordered">
      <settings-row  v-for="setting in settings" :setting="setting" :key="setting.var"/>
    </table>
  </div>
</template>


<script lang="ts">
import { Vue, Component, Prop} from 'vue-property-decorator';

import Setting from '@/models/Setting';

import SettingsRow from './SettingsRow.vue';

@Component({
  name: 'SettingsTab',
  components: {
    SettingsRow,
  },
})
export default class SettingsTab extends Vue {
  @Prop() public name!: string;
  @Prop() public settings!: Setting[];
}

</script>

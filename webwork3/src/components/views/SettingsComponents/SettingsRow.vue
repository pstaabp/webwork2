<template>
  <tr>
    <td><p><span v-html="setting.doc"></span>&nbsp;
        <font-awesome-icon icon='question-circle' size='lg' @click="show_help = !show_help" /></i>
      </p>
      <div v-if="show_help" class="help-box border p-2">
        <font-awesome-icon class="float-right" icon="window-close" @click="show_help = false"/>
        <span v-html="setting.doc2" />
      </div>
    </td>
    <td v-if="setting.type == 'text'">
      <b-input size="sm" :value="setting.value" @blur="setting.value = $event.target.value"/></td>
    <td v-if="setting.type == 'number'">
      <b-input type="number" size="sm" :value="setting.value" @blur="setting.value = $event.target.value"/></td>
    <td v-else-if="setting.type == 'popuplist'"><b-select size="sm" v-model="setting.value" :options="setting.values" /></td>
    <td v-else-if="setting.type === 'boolean'"><b-checkbox v-model="setting.value" /></td>
    <td v-else-if="setting.type === 'permission'"><b-select size="sm" v-model="setting.value" :options="permission_levels" /></td>
    <td v-else-if="setting.type === 'timezone'">NEED TO FINISH </td>
    <td v-else-if="setting.type === 'time'"><b-input type="time" size="sm" v-model="valueAsTime" /></td>
    <td v-else-if="setting.type === 'checkboxlist'">
      <b-checkbox-group :options="setting.values" v-model="selected" stacked />
    </td>
  </tr>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch} from 'vue-property-decorator';

import {Setting} from '@/store/models';

import * as moment from 'moment';

import Constants from '@/common';

import settings_store from '@/store/modules/settings';


@Component({
  name: 'SettingsTab',
})
export default class SettingsRow extends Vue {
  @Prop() public setting!: Setting;
  public selected: string[] = [];
  public show_help = false;

  get permission_levels() {
    return Object.values(Constants.permissionLevels());
  }
  get valueAsTime() {
    return moment.default(this.setting.value, ['hh:mmA']).format('HH:mm');
  }

  set valueAsTime(value: string) {
    this.setting.value = moment.default(value, ['HH:mm']).format('hh:mmA');
  }

  @Watch('setting', {deep: true })
  private onSettingChange(val: Setting, old_value: Setting) {
    settings_store.updateSetting(this.setting);
  }
}
</script>

<style scoped>
.help-box {
  position: relative;
}
.close {
    position: absolute;
    top: 2px;
    right: 2px;
}
</style>

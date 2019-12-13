<template>
  <tr>
    <td><p><span v-html="doc"></span>&nbsp;
        <font-awesome-icon icon='question-circle' size='lg' @click="show_help = !show_help" /></i>
      </p>
      <div v-if="show_help" class="help-box border p-2">
        <font-awesome-icon class="float-right" icon="window-close" @click="show_help = false"/>
        <span v-html="doc2" />
      </div>
    </td>
    <td v-if="type == 'text'"><b-input size="sm" :value="text_value" /></td>
    <td v-if="type == 'number'"><b-input type="number" size="sm" :value="value"/></td>
    <td v-else-if="type == 'popuplist'"><b-select size="sm" v-model="value" :options="values" /></td>
    <td v-else-if="type === 'boolean'"><b-checkbox v-model="value" /></td>
    <td v-else-if="type === 'permission'"><b-select size="sm" :value="value" :options="permission_levels" /></td>
    <td v-else-if="type === 'timezone'">NEED TO FINISH </td>
    <td v-else-if="type === 'time'"><b-input type="time" size="sm" :value="valueAsTime" /></td>
    <td v-else-if="type === 'checkboxlist'">
      <b-checkbox-group :options="values" v-model="selected" stacked />
    </td>
  </tr>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch} from 'vue-property-decorator';

import Setting from '@/models/Setting';

import * as moment from 'moment';

import Constants from '@/Constants';

// set up the store
import { getModule } from 'vuex-module-decorators';
import WeBWorKStore from '@/store';
const store = getModule(WeBWorKStore);


@Component({
  name: 'SettingsTab',
})
export default class SettingsRow extends Vue {
  @Prop() public setting!: Setting;
  public selected: string[] = [];
  public show_help = false;
  public text_value: string = "";

  get doc() {
    return this.setting.get('doc');
  }

  get doc2() {
    return this.setting.get('doc2');
  }

  get type() {
    return this.setting.get('type');
  }

  get value() {
    return this.setting.get('value');
  }

  set value(val: any) {
    // tslint:disable-next-line
    console.log(val);
    this.setting.set('value', val);
  }

  get values() {
    return this.setting.get('values');
  }

  get permission_levels() {
    return Object.values(Constants.permissionLevels());
  }

  private parseTime(time: string) {
    return moment.default(time, 'hh:mma').format('HH:mm');
  }

  get valueAsTime() {

    const time = moment(this.setting.get('value'),"HH:MMA");
    // tslint:disable-next-line
    console.log(time);
    return this.value;
  }

  set valueAsTime(value: string) {
    this.setting.set('value', value);

    // tslint:disable-next-line
    console.log("in valueAsTime");
  }

  @Watch('setting', {deep: true })
  private onSettingChange() {
    // tslint:disable-next-line
    console.log("setting changed");
    store.updateSetting(this.setting);
  }

  @Watch('text_value')
  private onTextValueChange() {
    // tslint:disable-next-line
    console.log(text_value);
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

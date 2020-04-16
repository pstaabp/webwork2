<!-- SettingsRow.vue

The SettingsRow component handles the viewing/editing of an individual setting. -->

<script lang="ts">
import { Vue, Component, Prop, Watch } from "vue-property-decorator";

import { Setting } from "@/store/models";

import * as moment from "moment";

import { permissionLevels, emptySetting } from "@/common";

import settings_store from "@/store/modules/settings";

@Component({
  name: "SettingsTab",
})
export default class SettingsRow extends Vue {
  @Prop() public var!: string;

  private setting: Setting = emptySetting();
  private selected: string[] = []; // for checkbox lists
  private bool_value = false; // for booleans
  private duration = ""; // for duration types
  private show_help = false;

  private get permission_levels() {
    return Object.values(permissionLevels());
  }

  // determine based on setting name if this is a duration type:
  // This is a hack and should be changed in webwork2

  // Note: include "pg{ansEvalDefaults}{reducedScoringPeriod}"

  private get is_duration() {
    return [
      "sessionKeyTimeout",
      "pg{assignOpenPriorToDue}",
      "pg{answersOpenAfterDueDate}",
    ].includes(this.setting.var);
  }

  private get valid_duration() {
    return /^(\d+):([0-5]\d):([0-5]\d)$/.test(this.duration);
  }

  private formatDuration(_duration: number) {
    const hours = Math.floor(_duration / 3600);
    const mins = Math.floor((_duration % 3600) / 60);
    const secs = _duration % 60;
    return (
      hours +
      ":" +
      (mins < 10 ? "0" + mins : mins) +
      ":" +
      (secs < 10 ? "0" + secs : secs)
    );
  }

  private parseDuration(_value: string) {
    const match = _value.match(/^(\d+):([0-5]\d):([0-5]\d)$/);
    return match
      ? parseInt(match[1], 10) * 3600 +
          parseInt(match[2], 10) * 60 +
          parseInt(match[3], 10)
      : 0;
  }

  private valueAsTime(_value: string) {
    return moment.default(_value, ["hh:mmA"]).format("HH:mm");
  }

  private updateDuration() {
    if (this.valid_duration) {
      this.updateSetting(this.parseDuration(this.duration));
    }
  }

  private updateTimeSetting(_value: string) {
    this.updateSetting(moment.default(_value, ["HH:mm"]).format("hh:mmA"));
  }

  private updateSetting(_value: string | number | string[] | boolean) {
    if (JSON.stringify(_value) !== JSON.stringify(this.setting.value)) {
      settings_store.updateSetting(
        Object.assign({}, this.setting, { value: _value })
      );
    }
  }

  private beforeMount() {
    // it appears that things aren't synching well.
    // this grabs the setting from the settings_store to set all values.

    const setting = settings_store.settings.get(this.var);
    this.setting = setting ? setting : emptySetting();

    if (this.setting.type === "checkboxlist") {
      this.selected = this.setting.value as string[];
    } else if (this.is_duration) {
      this.duration = this.formatDuration(this.setting.value as number);
    } else if (this.setting.type === "boolean") {
      this.bool_value = (this.setting.value as unknown) as boolean;
    }
  }

  @Watch("bool_value")
  private boolValueChanged() {
    this.updateSetting(this.bool_value);
  }

  @Watch("selected")
  private selectedChange(_new_value: string[]) {
    this.updateSetting(_new_value);
  }
}
</script>

<template>
  <tr>
    <td class="left-column">
      <p>
        <!-- eslint-disable-next-line vue/no-v-html -->
        <span v-html="setting.doc" />&nbsp;
        <b-icon
          icon="question-circle-fill"
          size="lg"
          @click="show_help = !show_help"
        />
      </p>
      <div v-if="show_help" class="help-box border p-2 rounded">
        <span class="float-right rounded border p-1" @click="show_help = false">
          <b-icon icon="x" />
        </span>
        <!-- eslint-disable-next-line vue/no-v-html -->
        <span v-html="setting.doc2" />
      </div>
    </td>
    <td v-if="is_duration" class="right-column">
      <b-form-group label="hours:minutes:seconds">
        <b-input
          v-model="duration"
          size="sm"
          label-size="sm"
          :state="valid_duration"
          trim
          @blur="updateDuration"
        />
      </b-form-group>
    </td>
    <td v-else-if="(setting.type == 'text' && setting.width >20)" class="right-column">
      <b-textarea :value="setting.value" @blur="updateSetting($event.target.value)" rows="5"/>
    </td>
    <td v-else-if="setting.type == 'list'" class="right-column">
      <b-textarea :value="setting.value.join(',')" @blur="updateList($event.target.value)" rows="5" />
    </td>
    <td v-else-if="setting.type == 'text'" class="right-column">
      <b-input
        size="sm"
        :value="setting.value"
        @blur="updateSetting($event.target.value)"
      />
    </td>
    <td v-else-if="setting.type == 'number'" class="right-column">
      <b-input
        type="number"
        size="sm"
        :value="setting.value"
        @blur="updateSetting($event.target.value)"
      />
    </td>
    <td v-else-if="setting.type == 'popuplist'" class="right-column">
      <b-select
        size="sm"
        :value="setting.value"
        :options="setting.values"
        @change="updateSetting($event)"
      />
    </td>
    <td v-else-if="setting.type === 'boolean'" class="right-column">
      <b-checkbox v-model="bool_value" />
    </td>
    <td v-else-if="setting.type === 'permission'" class="right-column">
      <b-select
        size="sm"
        :value="setting.value"
        :options="permission_levels"
        @change="updateSetting($event)"
      />
    </td>
    <td v-else-if="setting.type === 'timezone'" class="right-column">NEED TO FINISH</td>
    <td v-else-if="setting.type === 'time'" class="right-column">
      <b-input
        type="time"
        size="sm"
        :value="valueAsTime(setting.value)"
        @blur="updateTimeSetting($event.target.value)"
      />
    </td>
    <td v-else-if="setting.type === 'checkboxlist'" class="right-column">
      <b-checkbox-group v-model="selected" :options="setting.values" stacked />
    </td>
  </tr>
</template>

<style scoped>
.left-column {
  width: 60%;
}
.right-column {
  width: 40%;
}
.help-box {
  position: relative;
  background: lightyellow;
}
.close {
  position: absolute;
  top: 2px;
  right: 2px;
}
</style>

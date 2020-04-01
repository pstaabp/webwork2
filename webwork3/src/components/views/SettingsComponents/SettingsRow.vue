<template>
  <tr>
    <td>
      <p>
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
        <span v-html="setting.doc2" />
      </div>
    </td>
    <td v-if="is_duration">
      <b-form-group label="hours:minutes:seconds">
        <b-input
          size="sm"
          label-size="sm"
          v-model="duration"
          :state="valid_duration"
          @blur="updateDuration"
          trim
        />
      </b-form-group>
    </td>
    <td v-else-if="setting.type == 'text'">
      <b-input
        size="sm"
        :value="setting.value"
        @blur="updateSetting($event.target.value)"
      />
    </td>
    <td v-else-if="setting.type == 'number'">
      <b-input
        type="number"
        size="sm"
        :value="setting.value"
        @blur="updateSetting($event.target.value)"
      />
    </td>
    <td v-else-if="setting.type == 'popuplist'">
      <b-select
        size="sm"
        :value="setting.value"
        :options="setting.values"
        @change="updateSetting($event)"
      />
    </td>
    <td v-else-if="setting.type === 'boolean'">
      <b-checkbox v-model="bool_value" />
    </td>
    <td v-else-if="setting.type === 'permission'">
      <b-select
        size="sm"
        :value="setting.value"
        :options="permission_levels"
        @change="updateSetting($event)"
      />
    </td>
    <td v-else-if="setting.type === 'timezone'">NEED TO FINISH</td>
    <td v-else-if="setting.type === 'time'">
      <b-input
        type="time"
        size="sm"
        :value="setting.value | valueAsTime"
        @blur="updateTimeSetting($event.target.value)"
      />
    </td>
    <td v-else-if="setting.type === 'checkboxlist'">
      <b-checkbox-group :options="setting.values" v-model="selected" stacked />
    </td>
  </tr>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from "vue-property-decorator";

import { Setting } from "@/store/models";

import * as moment from "moment";

import Constants from "@/common";

import settings_store from "@/store/modules/settings";

@Component({
  name: "SettingsTab",
  filters: {
    valueAsTime: function (_value: string) {
      return moment.default(_value, ["hh:mmA"]).format("HH:mm");
    },
  },
})
export default class SettingsRow extends Vue {
  @Prop() public setting!: Setting;
  private selected: string[] = [];
  private show_help = false;
  private duration = "";
  private bool_value = false;
  private loading = true;

  private get permission_levels() {
    return Object.values(Constants.permissionLevels());
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
    const _match = _value.match(/^(\d+):([0-5]\d):([0-5]\d)$/);
    return _match
      ? parseInt(_match[1], 10) * 3600 +
          parseInt(_match[2], 10) * 60 +
          parseInt(_match[3], 10)
      : 0;
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
    const _setting = Object.assign({}, this.setting, { value: _value });
    // console.log(_setting); // eslint-disable-line no-console
    settings_store.updateSetting(_setting);
  }

  private beforeMount() {
    // for a checkbox group, we need to use the v-model to properly set and read it.
    if (this.setting.type === "checkboxlist") {
      this.selected = this.setting.value as string[];
    } else if (this.is_duration) {
      this.duration = this.formatDuration(this.setting.value as number);
    } else if (this.setting.type === "boolean") {
      this.bool_value = this.setting.value as boolean;
    }
  }

  private mounted() {
    this.loading = false;
  }

  private created() {
    this.$store.subscribe((mutation, state) => {
      //  console.log(mutation); // eslint-disable-line no-console
      if (
        mutation.type === "settings/SET_SETTING" &&
        mutation.payload &&
        mutation.payload.var &&
        mutation.payload.var === this.setting.var
      ) {
        console.log(mutation.payload.var); // eslint-disable-line no-console
        console.log(settings_store.settings.get(this.setting.var)); // eslint-disable-line no-console
        this.bool_value = settings_store.settings.get(this.setting.var);
      }
    });
  }

  @Watch("bool_value")
  private boolValueChanged(_new: boolean, _old: boolean) {
    // console.log([_new, _old]); // eslint-disable-line no-console
    // console.log(this.setting); // eslint-disable-line no-console
    if (!this.loading && this.setting.value !== _new) {
      console.log(this.setting); // eslint-disable-line no-console
      this.updateSetting(this.bool_value);
    }
  }

  @Watch("setting")
  private settingChanged() {
    console.log("in watch setting"); // eslint-disable-line no-console
  }

  @Watch("selected")
  private selectedChange(_newValue: string[], _oldValue: string[]) {
    if (JSON.stringify(_newValue) !== JSON.stringify(this.setting.value)) {
      this.updateSetting(_newValue);
    }
  }
}
</script>

<style scoped>
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

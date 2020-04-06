<!-- SettingsRow.vue

The SettingsRow component handles the viewing/editing of an individual setting. -->

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
    const match = _value.match(/^(\d+):([0-5]\d):([0-5]\d)$/);
    return match
      ? parseInt(match[1], 10) * 3600 +
          parseInt(match[2], 10) * 60 +
          parseInt(match[3], 10)
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
    settings_store.updateSetting(
      Object.assign({}, this.setting, { value: _value })
    );
  }

  private beforeMount() {
    // for a checkbox group, we need to use the v-model to properly set and read it.
    if (this.setting.type === "checkboxlist") {
      this.selected = this.setting.value as string[];
    } else if (this.is_duration) {
      this.duration = this.formatDuration(this.setting.value as number);
    } else if (this.setting.type === "boolean") {
      this.bool_value = (this.setting.value as unknown) as boolean;
    }
  }

  private mounted() {
    this.loading = false;
  }

  private created() {
    this.$store.subscribe((mutation) => {
      //  console.log(mutation); // eslint-disable-line no-console
      if (
        this.setting.type === "boolean" &&
        mutation.type === "settings/SET_SETTING" &&
        mutation.payload &&
        mutation.payload.var &&
        mutation.payload.var === this.setting.var
      ) {
        console.log(mutation.payload.var); // eslint-disable-line no-console
        console.log(settings_store.settings.get(this.setting.var)); // eslint-disable-line no-console
        this.bool_value = (settings_store.settings.get(
          this.setting.var
        ) as unknown) as boolean;
      }
    });
  }

  @Watch("bool_value")
  private boolValueChanged() {
    this.updateSetting(this.bool_value);
    // if (!this.loading && this.setting.value !== _new) {
    //   console.log(this.setting); // eslint-disable-line no-console
    //   this.updateSetting(this.bool_value);
    // }
  }

  @Watch("setting")
  private settingChanged() {
    console.log("in watch setting"); // eslint-disable-line no-console
  }

  @Watch("selected")
  private selectedChange(_new_value: Setting) {
    // if (JSON.stringify(_new_value) !== JSON.stringify(this.setting.value)) {
    this.updateSetting(_new_value.value);
    // }
  }
}
</script>

<template>
  <tr>
    <td>
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
    <td v-if="is_duration">
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
        :value="valueAsTime(setting.value)"
        @blur="updateTimeSetting($event.target.value)"
      />
    </td>
    <td v-else-if="setting.type === 'checkboxlist'">
      <b-checkbox-group v-model="selected" :options="setting.values" stacked />
    </td>
  </tr>
</template>

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

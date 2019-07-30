<template>
  <tr>
    <td><p>{{setting.doc}}&nbsp;<i class="fas fa-question-circle" @click="showhelp($event.target,setting.doc2)"></i></p>
        <div class="help-box border p-2 d-none"><span></span>
          <i class="close far fa-window-close" @click="closeHelp($event.target)"></i></div></td>
    <td>{{setting.value}}</td>
    <td v-if="setting.type == 'text'"><b-input size="sm" :value="setting.value" /></td>
    <td v-if="setting.type == 'number'">
      <b-input type="number" size="sm" :value="setting.value" @blur="update($event.target)"/></td>
    <td v-else-if="setting.type == 'popuplist'">
      <b-select size="sm" :value="setting.value">
        <option v-for="item in setting.values" :key="item">{{item}}</option>
      </b-select>
    </td>
    <td v-else-if="setting.type == 'boolean'"><b-checkbox v-model="setting.value" /></td>
    <td v-else-if="setting.type == 'permission'">
      <b-select size="sm" :value="setting.value" :options="permission_levels" />
    </td>
    <td v-else-if="setting.type == 'timezone'">NEED TO FINISH </td>
    <td v-else-if="setting.type == 'time'">
        <b-input type="time" size="sm" :value="parseTime(setting.value)" /></td>
  </tr>
</template>

<script>
import moment from 'moment';

export default {
  name: 'SettingsTab',
  props: {
    setting: Object,
  },
  data() {
    return {
      permission_levels : [
        'guest', 'student', 'login_proctor', 'grade_proctor',
        'ta', 'professor', 'admin',
      ],
    }; // return
  }, // data
  methods: {
    parseTime: (time) => moment(time, 'hh:mma').format('HH:mm'),
    update(target) {
      const setting = this.setting;
      setting.value = target.value;
      this.$store.dispatch('updateSetting', setting);
    },
    showhelp(target, helpText) {
      const helpBox = target.parentElement.parentElement.lastElementChild;
      helpBox.className = 'help-box border p-2';
      helpBox.firstElementChild.innerHTML = helpText;
    },
    closeHelp(target) {
      target.parentElement.className = 'help-box d-none';
    },
  },

};

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

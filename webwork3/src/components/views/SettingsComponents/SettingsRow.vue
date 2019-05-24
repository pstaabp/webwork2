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
import moment from 'moment'

export default {
  name: "SettingsTab",
  props: {
    setting: Object
  },
  data: function(){
    return {
      permission_levels : [
        "guest","student","login_proctor","grade_proctor",
        "ta","professor","admin"
      ]
    }
  }, // data
  methods: {
    parseTime: (_time) => moment(_time, "hh:mma").format("HH:mm"),
    update(target) {
      // eslint-disable-next-line
      console.log(target.value);
      var _setting = this.setting;
      _setting.value = target.value; 
      this.$store.dispatch("updateSetting",_setting)
    },
    showhelp(target,help_text){
      const help_box = target.parentElement.parentElement.lastElementChild;
      help_box.className = "help-box border p-2"
      help_box.firstElementChild.innerHTML = help_text
    },
    closeHelp(target){
      target.parentElement.className = "help-box d-none"
    }
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

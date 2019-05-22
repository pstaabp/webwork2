<template>
  <b-tabs content-class="mt-3">
    <b-tab title="Settings 1" active><h3>Setting 1</h3></b-tab>
    <b-tab title="Settings 2"><h3>Settings 2</h3></b-tab>
    <b-tab title="Settings 3"><h3>Settings 3</h3></b-tab>
    <b-tab title="Settings 4"><h3>Settings 4</h3></b-tab>
  </b-tabs>
</template>


<script>
import SettingList from '../../models/SettingList.js'

export default {
  name: 'SettingsView',
  data: function () {
    return {

    }
  },
  props: {
    settings: SettingList
  },
  created: function (){
    // eslint-disable-next-line
    console.log("hi");
  }
}
</script>

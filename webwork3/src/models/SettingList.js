import {Collection} from 'vue-mc'

import Setting from "./Setting.js"

export default class SettingList extends Collection {
  options() {
    return {
      model: Setting
    }
  }

  routes() {
    return {
      fetch: '/webwork3/api/courses/test/settings'
    }
  }
}

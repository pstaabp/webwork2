import {Collection} from 'vue-mc'

import User from "./User.js"

export default class UserList extends Collection {
  options() {
    return {
      model: User
    }
  }

  routes() {
    return {
      fetch: '/webwork3/api/courses/test/users'
    }
  }
}

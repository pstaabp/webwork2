import {Collection} from 'vue-mc'

import ProblemSet from "./ProblemSet.js"

export default class ProblemSetList extends Collection {
  options() {
    return {
      model: ProblemSet
    }
  }

  routes() {
    return {
      fetch: '/webwork3/api/courses/test/sets',
    }
  }
}

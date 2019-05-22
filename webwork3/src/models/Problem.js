import {Model} from 'vue-mc'

export default class Problem extends Model {
  defaults() {
    return {
      problem_id:   0,
      source_file:"",  // the path to the problem in the courses/templates directory
      pgsource: "",  // source of the problem as a string.
      data: "",  // the HTML source of the problem.
      value: 1,
      max_attempts: -1,
    }
  }

  routes() {
    return {
      fetch: '/webwork3/api/renderer/courses/test/problems/0',
    }
  }
}

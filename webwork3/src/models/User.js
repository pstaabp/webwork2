import {Model} from 'vue-mc'

export default class User extends Model {
  defaults() {
    return {
      user_id:   "",
      comment: "",
      displayMode: "MathJax",
      email_address: "",
      first_name: "",
      last_name: "",
      lis_source_did: "",
      permission: "",
      recitation: "",
      section: "",
      showOldAnswers: false,
      status: "",
      student_id: "",
      useMathView: false,
      useWirisEditor: false
    }
  }

  routes() {
    return {
      fetch: '/webwork3/api/courses/test/users/{{user_id}}',
    }
  }
}

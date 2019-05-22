import {Model} from 'vue-mc'

export default class Setting extends Model {
  defaults() {
    return {
      category: "",
      doc: "",
      doc2: "",
      name: "",
      value: "",
      type: "",
      var: "",
      width: 0
    }
  }
}

<template>
  <div>
    <b-container>
      <b-row>
        <b-col>
          <b-form-group label="Select from" label-cols="6">
          <b-select size="sm" v-model="problem_type">
            <option value="set">Existing Set</option>
            <option value="library">Problem Library</option>
            <option value="template">From Template</option>
          </b-select></b-form-group>
        </b-col>
        <b-col v-if="problem_type=='set'" cols="3">
          <b-form-group label="Set Name:" label-cols="4">
            <b-select size="sm" v-model="selected_set_id" :options="getSetNames">

            </b-select>
          </b-form-group>
        </b-col>
        <b-col v-if="problem_type=='set'" cols="3">
          <b-form-group label="Problem:" label-cols="4">
            <b-select size="sm" v-model="selected_problem" :options="getProblems"
                @change="updateSource"/>
          </b-form-group>
        </b-col>
        <b-col><b-btn size="sm" variant="outline-dark" v-b-modal.save-as-problem-modal>Save Problem As...</b-btn></b-col>
      </b-row>
      <b-row>
        <b-tabs content-class="mt-3">
          <b-tab title="Problem Source" active>
            <div v-if="not_editable">This problem is from the library and is read-only.  Please select "Save As..."
              to create a local, editable copy.</div>
            <codemirror id="source" :value="problem_source" :options="cm_opts" />
          </b-tab>
          <b-tab title="Rendered Problem" @click="render">
            <div v-html="problem_html" />
          </b-tab>
        </b-tabs>
      </b-row>
    </b-container>
    <save-as-problem-modal />
  </div>
</template>

<script>
import {mapState} from 'vuex'
import axios from 'axios'
import { codemirror } from 'vue-codemirror-lite'
require('codemirror/mode/perl/perl')
import 'codemirror/theme/paraiso-light.css'

import SaveAsProblemModal from "./EditorComponents/SaveAsProblemModal"

export default {
  name: "Editor",
  components: {
    codemirror, SaveAsProblemModal
  },
  data: function(){
    return {
      problem_type: "set",
      selected_set_id: "",
      selected_problem: 0,
      problem_source: "",
      problem_path: "",
      problem_html: "",
      cm_opts: {
        mode: 'perl',
        theme: 'paraiso-light',
        height: 500,
        readOnly: true
      }
    }
  },
  computed:{
    ...mapState(['problem_sets','login_info']),
    getSetNames() { return this.problem_sets.map(_set => _set.set_id)},
    getProblems(){
      const _set = this.problem_sets.find(_set => _set.set_id == this.selected_set_id );
      return _set ? _set.problems.map(_prob => _prob.problem_id) : []
    },
    not_editable(){
      return /^Library/.test(this.problem_path)
    }
  },
  methods: {
    updateSource(){
      const _set = this.problem_sets.find(_set => _set.set_id == this.selected_set_id );
      const _prob = _set.problems.find(_prob => _prob.problem_id == this.selected_problem);
      // eslint-disable-next-line
      console.log(_prob);
      this.problem_path = _prob.source_file;
      axios.get("/webwork3/api/courses/" + this.login_info.course_id + "/library/fullproblem",{params: _prob})
            .then((response) => {
              // eslint-disable-next-line
              console.log(response);
              this.problem_source = response.data.problem_source
            })
    },
    render(){
      // eslint-disable-next-line
      console.log("in render")
      axios.post("/webwork3/api/renderer",{source: this.problem_source})
        .then((response) => {
          // eslint-disable-next-line
          console.log(response.data);
          this.problem_html = response.data.text;
        })
    },
    saveAs(){

    }
  },
  updated() {
    // eslint-disable-next-line
    MathJax.Hub.Queue(["Typeset",MathJax.Hub]);
  }

}
</script>

<style>
.CodeMirror {
  border: 1px solid black;
  height: 500px;
  width: 100%
}
</style>

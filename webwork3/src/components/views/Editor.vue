<template>
  <div>
    <b-container>
      <b-row>
        <b-col cols="3">
          <b-form-group label="Select from" label-cols="6">
          <b-select size="sm" v-model="problem_type">
            <option value=""><em>Select...</em></option>
            <option value="set">Existing Set</option>
            <option value="library">Problem Library</option>
            <option value="template">From Template</option>
          </b-select></b-form-group>
        </b-col>
        <b-col v-if="problem_type=='set'" cols="3">
          <b-form-group label="Set Name:" label-cols="4">
            <b-select size="sm" v-model="selected_set_id" :options="set_names">

            </b-select>
          </b-form-group>
        </b-col>
        <b-col v-if="problem_type=='set'" cols="3">
          <b-form-group label="Problem:" label-cols="4">
            <b-select size="sm" v-model="selected_problem" :options="problems"
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
              <textarea id="source" rows="10"> </textarea>
          </b-tab>
          <b-tab title="Rendered Problem" @click="renderProblem">
            <div v-html="problem_html" />
          </b-tab>
        </b-tabs>
      </b-row>
    </b-container>
    <save-as-problem-modal />
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch} from 'vue-property-decorator';
import axios from 'axios';
import * as CodeMirror from 'codemirror';
import 'codemirror/mode/perl/perl.js';
import 'codemirror/lib/codemirror.css';


import SaveAsProblemModal from './EditorComponents/SaveAsProblemModal.vue';

import {Problem} from '@/store/models';

import {renderProblem} from '@/store/api';
import Common from '@/common';

import problem_sets_store from '@/store/modules/problem_sets';
import login_store from '@/store/modules/login';


@Component({
  name: 'Editor',
  components: {
    SaveAsProblemModal,
  },
})
export default class ProblemEditor extends Vue {
  private problem_type = '';
  private selected_set_id = '';
  private selected_problem = 0;
  private problem_source = 'var x = 5;';
  private problem_path = '';
  private problem_html = '';
  private cm: CodeMirror.Editor!;

  private get set_names() {
    return [...[{value: '', text: 'Select Set'}],
            ...problem_sets_store.set_names.map( (_set_id: string) => ({value: _set_id, text: _set_id}))];

  }

  private get problems() {
    const _set = problem_sets_store.problem_sets.get(this.selected_set_id);
    return _set ? [...[{value: '', text: 'Select Problem'}],
                      ..._set.problems.map( (_prob) => ({value: _prob.problem_id, text: _prob.problem_id}) )] :
                      [];
  }

  private not_editable() {
    return /^Library/.test(this.problem_path);
  }

  private updateSource() {
    const _set = problem_sets_store.problem_sets.get(this.selected_set_id);
    if (_set) {
      const _prob = _set.problems.find((prob: Problem) => prob.problem_id === this.selected_problem);
      if (_prob) {
        this.problem_path = _prob.source_file;
        axios.get(login_store.api_header + '/library/fullproblem', {params: _prob})
              .then((response) => {
                this.problem_source = response.data.problem_source;
                this.cm.setValue(this.problem_source);
              });
            }
          }
  }

  private async renderProblem() {
    const _prob = Common.newProblem();
    _prob.problem_source = this.problem_source;
    const problem = await renderProblem(_prob);
    this.problem_html = problem.text;
  }

  private mounted() {
    const config: CodeMirror.EditorConfiguration = {
      tabSize: 2,
      lineNumbers: true,
      mode: 'perl',
    };
    const text_area = document.getElementById('source') as HTMLTextAreaElement;
    this.cm = CodeMirror.fromTextArea(text_area, config);
    this.cm.setValue(this.problem_source);
  }

  private updated() {
    MathJax.Hub.Queue(['Typeset', MathJax.Hub]);
  }
}
</script>

<style scoped>
#source {
  border: 1px solid black;
  width: 100%
}
</style>

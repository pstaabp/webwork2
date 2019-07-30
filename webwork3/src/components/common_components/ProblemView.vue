<template>
  <li class="problem p-2 rounded">
    <b-container>
      <b-row>
        <b-btn-toolbar>
          <b-input-group size="sm" v-if="typeProp('numbered')">
            <span class="problem-id">{{problem.problem_id}}</span>
          </b-input-group>
          <b-input-group size="sm" prepend="Value:" class="col-3" v-if="typeProp('value')" >
            <b-input type="number" v-model="problem.value"/>
          </b-input-group>
          <b-input-group size="sm" prepend="Max. Att.:" class="col-3" v-if="typeProp('attempts')">
            <b-input type="number" v-model="problem.max_attempts"/>
          </b-input-group>
          <b-btn-group size="sm">
            <b-btn variant="outline-dark" title="add problem" v-if="typeProp('add')"
                @click="$emit('add-problem',problem)">
              <i class="fas fa-plus"></i></b-btn>
            <b-btn variant="outline-dark" title="edit" v-if="typeProp('edit')" disabled>
              <i class="fas fa-pencil-alt"></i></b-btn>
            <b-btn variant="outline-dark" title="randomize" v-if="typeProp('randomize')"
              @click="randomize"> <i class="fas fa-sync"></i></b-btn>
            <b-btn variant="outline-dark" title="delete problem" v-if="typeProp('delete')">
              <i class="fas fa-trash-alt"></i></b-btn>
            <b-btn variant="outline-dark" title="Mark this problem correct for all assigned users."
                v-if="typeProp('mark_all')" disabled><i class="fa fa-check"></i></b-btn>
            <b-btn variant="outline-dark" title="show/hide tags" v-if="typeProp('tags')">
              <i class="fas fa-tags"></i></b-btn>
            <b-btn :variant="show_path ? 'success' : 'outline-dark'" title="show/hide path" v-if="typeProp('path')"
                @click="show_path = !show_path">
              <i class="fas fa-file"></i></b-btn>
            <b-btn variant="outline-dark" title="This problem is in the target set." v-if="typeProp('target_set')">
              <i class="fas fa-bullseye"></i>
            </b-btn>
          </b-btn-group>
        </b-btn-toolbar>
        <b-btn-group size="sm" class="float-right" v-if="typeProp('reorder')">
          <i class="fa fa-arrows-alt-v drag-handle border border-dark rounded p-2"></i>
        </b-btn-group>


      </b-row>
      <b-row v-if="show_path">
        Path: {{problem.source_file}}
      </b-row>
      <b-row>
        <div v-if="html == ''" class="text-center">
          <b-spinner variant="info" />
        </div>
        <div v-else class="problem-tag-container" v-html="html"></div>
      </b-row>
    </b-container>
  </li>

</template>



<script>
import axios from 'axios';
import {mapState} from 'vuex';

export default {
  name: 'ProblemView', // name of the view
  props: {
    problem: Object,
    type: String,
    // problem_sets: ProblemSetList
  },
  data() {
    return {
      html: '',
      show_tags: false,
      show_path: false,
    };
  },
  computed: mapState(['login_info']),
  mounted() {
    this.model = null;
    this.fetchProblem();
  },
  methods: {
    fetchProblem(otherParams) {
      this.html = '';
      axios.get('/webwork3/api/renderer/courses/' + this.login_info.course_id + '/problems/0',
                  {params: Object.assign({}, this.problem, otherParams)})
          .then( (response) => {
            this.html = response.data.text;
          });
    },
    typeProp(prop) {
      return this.type === 'library' ? LIB_PROB[prop] : SET_PROB[prop];
    },
    addProblem(evt) {
      // tslint:disable-next-line
      console.log(evt);
    },
    randomize() {
      this.fetchProblem({problem_seed: Math.floor(10000 * Math.random())});
    },
  },
  watch: {
    problem() {
      this.model = null;
      this.fetchProblem();
    },
  },
  updated() {
  // tslint:disable-next-line
    MathJax.Hub.Queue(['Typeset',MathJax.Hub]);
  },
};

const LIB_PROB = { // define characteristics of a library problem.
  numbered: false,
  reorder: false,
  add: true,
  value: false,
  attempts: false,
  edit: true,
  randomize: true,
  delete: false,
  mark_all: false,
  tags: true,
  path: true,
  target_set: true,
};

const SET_PROB = { // define characteristics of a library problem.
  numbered: true,
  reorder: true,
  add: false,
  value: true,
  attempts: true,
  edit: true,
  randomize: true,
  delete: true,
  mark_all: true,
  tags: false,
  path: false,
  target_set: false,
};
</script>

<style>
.problem-id {font-weight: bold; font-size: 120%; padding-right: 1ex;}
.problem {
  list-style: none;
  border: 1px black solid;
  width: 100%
}
</style>

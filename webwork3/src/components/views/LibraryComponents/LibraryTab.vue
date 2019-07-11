<template>
  <b-container>
    <library-subjects v-if="tab_name == 'subjects'" @load-problems="loadProblems"/>
    <library-directory v-if="tab_name == 'directory'" @load-problems="loadProblems"/>
    <library-textbooks v-if="tab_name == 'textbooks'" @load-problems="loadProblems"/>
    <local-library v-if="tab_name == 'local'" @load-problems="loadProblems"/>
    <b-row v-if="get_problems.length > 0" class="mt-2">
      <b-col>
        <b-pagination v-model="current_page" :total-rows="num_problems" :per-page="rows_per_page"
        limit="10" size="sm"/>
      </b-col>
      <b-col>
        {{current_page}}
      </b-col>
      <b-col cols="3">
        <b-form-group label="Target Set:" label-size="sm" label-cols="4"
          :state="valid_set_id">
          <b-select size="sm" :options="get_set_ids" v-model="selected_set_id" :state="valid_set_id">
            <template slot="first">
              <option :value="null" disabled>Select a Set</option>
            </template>
          </b-select>
        </b-form-group>
      </b-col>
      <b-col cols="2">
        <b-btn size="sm" variant="outline-dark" :disabled="!valid_set_id" @click="go_to_set">Go to Target Set</b-btn>
      </b-col>
    </b-row>
    <b-row>
      <div class="scrollable">
        <problem-view v-for="problem in get_problems" :key="problem.problem_id" :problem="problem" type="library"
          @add-problem="addProblem"/>
        </div>
    </b-row>
  </b-container>
</template>

<script>
import common from '@/common'
import {mapState} from 'vuex'

import LibrarySubjects from './LibrarySubjects'
import LibraryDirectory from './LibraryDirectory'
import LibraryTextbooks from './LibraryTextbooks'
import LocalLibrary from './LocalLibrary'
import ProblemView from '@/components/common_components/ProblemView'

export default {
  name: "LibraryTab",
  components: {
    LibrarySubjects, LibraryDirectory, LibraryTextbooks,
    ProblemView, LocalLibrary
  },
  props: {
    problem_sets: Array,
    tab_name: String
  },
  data: function(){
    return {
      all_problems: [],
      current_page: 1,
      rows_per_page: 10,
      selected_set_id: null,
    }
  },
  methods: {
    loadProblems(_problems) {
      this.all_problems = _problems;
    },
    addProblem: function(_problem){

      const _set = this.problem_sets.find(set=>set.set_id==this.selected_set_id);
      if (_set == undefined) {
        return;
      }
      var problem = common.new_problem;
      problem.source_file = _problem.source_file;
      problem.set_id = _set.set_id;
      problem.problem_id = _set.problems.length + 1
      _set.problems.push(problem);
      this.$store.dispatch("updateProblemSet",_set)
    },
    go_to_set: function(){
      this.$router.push("/courses/" + this.login_info.course_id + "/manager/set-details?set_id=" + this.selected_set_id);
    }
  },
  computed: {
    ...mapState(['login_info']),
    valid_set_id: function () {
      return this.selected_set_id != undefined
    },
    get_set_ids: function(){
      return this.problem_sets.map(_set => _set.set_id)
    },
    num_problems: function (){
      return this.all_problems.length;
    },
    get_problems: function(){
      if(this.all_problems.length==0 || this.current_page == 0){
        return []
      }
      var probs = [];
      for(var i=(this.current_page-1)*this.rows_per_page;
          i < Math.min(this.all_problems.length,this.current_page*this.rows_per_page); i++){
        probs.push(this.all_problems[i]);
      }
      return probs;
    }
  }
}

</script>

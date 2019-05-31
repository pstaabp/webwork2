<template>
  <div>
    <b-container>
      <b-row class="pb-3">
        <b-col cols="3">
          <b-input-group size="sm">
            <b-form-input placeholder="Filter" v-model="filter_string"/>
            <b-input-group-append>
              <b-button size="sm" text="Button">X</b-button>
            </b-input-group-append>
          </b-input-group>
        </b-col>
        <b-col cols="9">
          <b-input-group size="sm" prepend="Show Time">
            <b-input-group-append is-text>
              <b-checkbox v-model="show_time"/>
            </b-input-group-append>
            <b-input-group-append>
              <b-btn v-b-modal.add-problem-set-modal>Add Problem Set</b-btn>
            </b-input-group-append>
            <b-dd variant="outline-dark" text="Action on Selected">
              <b-dd-item :disabled="selected_sets.length == 0" v-b-modal.edit-problem-sets-modal>Edit Problem Sets</b-dd-item>
              <b-dd-item :disabled="selected_sets.length == 0" @click="deleteSets">Delete Problem Sets</b-dd-item>
            </b-dd>
            <b-dd variant="outline-dark" text="Show Rows">
              <b-dd-item  default value="10">Show 10 rows</b-dd-item >
              <b-dd-item  value="25">Show 25 rows</b-dd-item >
              <b-dd-item  value="50">Show 50 rows</b-dd-item >
              <b-dd-item  value="0">Show all rows</b-dd-item >
            </b-dd>
          </b-input-group>
        </b-col>
      </b-row>
      <b-row>
        <b-table :items="getProblemSets" :fields="fields" :small="true" :bordered="true"
        primary-key="set_id" @row-selected="rowSelected" :filter="filter_string" selectable >
        <template slot="visible" slot-scope="data">
          <div class="mx-auto" width="100%">
            <i class="fas fa-check-circle text-success" :class="data.value ? 'd-block' : 'd-none'"></i>
            <i class="fas fa-times-circle text-danger" :class="data.value ? 'd-none' : 'd-block'"></i>
          </div>
        </template>
        <template slot="enable_reduced_scoring" slot-scope="data">
          <i class="fas fa-check-circle text-success" :class="data.value ? 'd-block' : 'd-none'"></i>
          <i class="fas fa-times-circle text-danger" :class="data.value ? 'd-none' : 'd-block'"></i>
        </template>
      </b-table>
    </b-row>
  </b-container>
  <add-problem-set-modal :problem_sets="getProblemSets" />
  <edit-problem-sets-modal :selected_sets="selected_sets" />
</div>
</template>



<script>
import moment from 'moment'
import AddProblemSetModal from './ProblemSetsManagerComponents/AddProblemSetModal.vue'
import EditProblemSetsModal from './ProblemSetsManagerComponents/EditProblemSetsModal.vue'

export default {
  name: 'ProblemSetsManager',
  data: function () {
      return {
        fields: [
          {key: "set_id", sortable: true, label: "Name"},
          {key: "assigned_users",sortable: true, label: "Users", formatter: "numUsers"},
          {key: "problems", sortable: true, label: "Num. Probs.", formatter: "numProbs"},
          {key: "visible", sortable: true},
          {key: "enable_reduced_scoring", label: "RS"},
          {key: "open_date", sortable: true, label: "Open Date", formatter: "formatDate"},
          {key: "reduced_scoring_date", sortable: true, label: "Red. Sc. Date", formatter: "formatDate"},
          {key: "due_date", sortable: true, label: "Due Date", formatter: "formatDate"},
          {key: "answer_date", sortable: true, label: "Answer Date", formatter: "formatDate"}
      ],
      selected_sets: [],
      users: [],
      show_time: false,
      filter_string: ""
    }
  },
  components: {
    AddProblemSetModal, EditProblemSetsModal
  },
  created: function(){
    this.users = this.$store.state.users
  },
  methods: {
    toDate: value => moment.unix(value).format("YYYY-MM-DD"),
    updateDate: function(data,field,value) {
      var _prob = this.problem_sets.find(_set => _set.set_id==data.set_id)
      _prob.set(field,moment(value,"YYYY-MM-DD").unix())
      // eslint-disable-next-line
      console.log(_prob)
      _prob.save();

    },
    rowSelected(rows){ this.selected_sets = rows },
    formatDate(_date){
      return this.show_time ? moment.unix(_date).format("MM/DD/YY [at] hh:mm a") :
          moment.unix(_date).format("MM/DD/YYYY")
    },
    numUsers(data){ return data.length +"/" + this.users.length;},
    numProbs(data){ return data.length},
    deleteSets(){
      const _sets = this.selected_sets.map(_set => _set.set_id);
      var conf = confirm("Are you sure you want to delete the following sets? " + _sets);

      if(conf){
        this.selected_sets.forEach( _set => {
          this.$store.dispatch("removeProblemSet",_set);
        });
      }
    }
  }, // methods
  computed: {
    getProblemSets() {return this.$store.state.problem_sets}
  },
  watch: {
    filter_string: function(){
      // eslint-disable-next-line
      console.log(this.filter_string);
    }
  }
}
</script>

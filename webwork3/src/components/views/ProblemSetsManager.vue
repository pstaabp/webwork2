<template>
  <div>
    <h2>Problem Sets</h2>
    <vuetable :api-mode="false" :data="local_problem_sets" :fields="fields">
      <div slot="edit-open-date" slot-scope="props">
        <b-input size="sm" type="date" :value="toDate(props.rowData.open_date)"
            @change="updateDate(props.rowData,'open_date',$event)" />
      </div>
      <div slot="edit-reduced-date" slot-scope="props">
        <b-input size="sm" type="date" :value="toDate(props.rowData.reduced_scoring_date)"
            @change="updateDate(props.rowData,'reduced_scoring_date',$event)"  />
      </div>
      <div slot="edit-due-date" slot-scope="props">
        <b-input size="sm" type="date" :value="toDate(props.rowData.due_date)"
            @change="updateDate(props.rowData,'due_date',$event)" />
      </div>
      <div slot="edit-answer-date" slot-scope="props">
        <b-input size="sm" type="date" :value="toDate(props.rowData.answer_date)"
            @change="updateDate(props.rowData,'answer_date',$event)"  />
      </div>
    </vuetable>
  </div>
</template>



<script>
import moment from 'moment'
import Vuetable from 'vuetable-2'

// models
// import ProblemSetList from '../../models/ProblemSetList.js'


export default {
  name: 'ProblemSetsManager',
  data: function () {
      return {
        fields: [
          {name: "set_id", sortField:"set_id", title: "Set Name"},
          {name: "edit-open-date", sortField: "open_date", title: "Open Date"},
          {name: "edit-reduced-date", sortField: "reduced_scoring_date",
              title: "Reduced Scoring Date"},
          {name: "edit-due-date", sortField: "due_date", title: "Due Date"},
          {name: "edit-answer-date", sortField: "answer_date", title: "Answer Date"}
      ],
      local_problem_sets: []
    }
  },
  created: function() {
    // eslint-disable-next-line
    console.log("in created");
    this.local_problem_sets = this.$store.state.problem_sets;
    // eslint-disable-next-line
    console.log(this.local_problem_sets);
  },
  components: {
    Vuetable
  },
  methods: {
    toDate: value => moment.unix(value).format("YYYY-MM-DD"),
    updateDate: function(data,field,value) {
      var _prob = this.problem_sets.find(_set => _set.set_id==data.set_id)
      _prob.set(field,moment(value,"YYYY-MM-DD").unix())
      // eslint-disable-next-line
      console.log(_prob)
      _prob.save();

    }
  }
}
</script>

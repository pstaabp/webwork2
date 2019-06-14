<template>
  <b-modal size="xl" id="import-students-file" ref="sfmodal" title="Import Students from a File">
    <b-container fluid>
      <b-row>
        <b-col>
          <b-form-file
          v-model="file"
          :state="Boolean(file)"
          placeholder="Choose a file..."
          drop-placeholder="Drop file here..."
          />
        </b-col>
        <b-col>
          <div class="mt-2">Selected file: {{ file ? file.name : '' }}</div>
        </b-col>
        <b-col>
          <b-input-group>
            <b-btn variant="outline-dark" size="sm" @click="loadFile">Load File</b-btn>
            <b-checkbox class="ml-3" v-model="use_first_row" @change="useFirstRow">Use first row as header</b-checkbox>
          </b-input-group>
        </b-col>
      </b-row>
      <b-row v-if="data != null">
        <b-col v-for="i in num_cols" :key="i">
          <b-select :options="headers" v-model="header_values[i-1]" size="sm"/>
        </b-col>
      </b-row>
      <b-row v-if="data != null">
        <b-table :items="data" :per-page="10" :current-page="page" small id="import-table"/>

        <b-pagination
        v-model="page"
        :total-rows="data == null ? 0: data.length"
        :per-page="10"
        aria-controls="myTable" />
      </b-row>
    </b-container>
    <div slot="modal-footer" class="w-100">
      <b-btn-group size="sm" class="float-right">
        <b-btn variant="outline-dark" @click="cancel">Cancel</b-btn>
        <b-btn variant="outline-dark" @click="addSelected">Add Selected Students</b-btn>
        <b-btn variant="primary" @click="addAll">Add All Students</b-btn>
      </b-btn-group>
     </div>
  </b-modal>
</template>



<script>
import Papa from 'papaparse'

export default {
  name: 'ImportStudentsFile',
  data: function() {
    return {
      file: null,
      data: null,
      use_first_row: false,
      page: 1,
      num_cols: 0,
      header_values: [],
      headers: [{value:  "user_id", text: "Login", regexp: "login|user"},
              { value:  'first_name', text: "First Name", regexp: "first"},
              { value:  'last_name',  text: "Last Name", regexp: "last"},
              { value:  'email_address', text: "Email", regexp: "email"},
              { value:  'student_id',  text: "Student ID", regexp: "student"},
              { value:  'status', text: "Status", regexp: "status"},
              { value:  'section',  text: "Sect.", regexp: "section"},
              { value:  'recitation',  text: "Rec.", regexp: "recitation"},
              { value:  'comment',  text: "Comment", regexp: "comment"},
              { value:  'permission',  text: "Permission", regexp: "permission"}
            ],
      first_row: []
    }
  },
  methods: {
    loadFile() {

      const reader = new FileReader();

      reader.readAsText(this.file);
      reader.onload = (evt) => {
        const users = Papa.parse(evt.target.result);
        // change this to an array of an object:
        this.data = users.data.map(row => Object.assign(...row.map((v,i) => ({["col"+i]: v}))));
        this.first_row = users.data[0];
        this.num_cols = users.data[0].length;
        this.header_values = Array.from(Array(this.num_cols).keys()).map( () => null);
      }
    },
    useFirstRow(){
      document.getElementById('import-table').rows[1].style.visibility = this.use_first_row ? "visible" : "collapse";
      this.use_first_row = ! this.use_first_row;
      // try to match the header fields
      this.headers.forEach((header) => {
        var re = new RegExp(header.regexp,"i");
        const k = this.first_row.findIndex(h=>re.test(h));
        if(k>-1){
          this.header_values[k] = header.value;
        }
      })
    },
    cancel() {this.$refs.sfmodal.hide()},
    addAll() {
      if(this.use_first_row){
        this.data.shift()
      }
      let _users = this.data.map(_u => this.header_values.reduce((result,_val,i) =>{
          result[_val] = _u["col"+i];
          return result;},{}));

      _users.forEach(_u => this.$store.dispatch("addUser",_u));
      this.$refs.sfmodal.hide();

    },
    addSelected() {this.$refs.sfmodal.hide()}

  }
}
</script>

<style scoped>
thead {display: none}
</style>

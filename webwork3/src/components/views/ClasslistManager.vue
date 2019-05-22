<template>
  <div>
    <b-container>
      <b-row>
        <b-col cols="3">
          <b-btn-toolbar>
            <b-input-group size="sm">
              <b-input placeholder="Filter"/>
            </b-input-group>
            <b-btn-group size="sm">
              <b-btn variant="outline-dark">X</b-btn>
            </b-btn-group>
          </b-btn-toolbar>
        </b-col>
        <b-col cols="3">
        </b-col>
        <b-col cols="6">
          <b-btn-group size="sm" >
            <b-dd variant="outline-dark" text="Action on Selected">
              <b-dd-item href="#">Email Students</b-dd-item>
              <b-dd-item href="#">Edit Students</b-dd-item>
              <b-dd-item href="#">Delete Students</b-dd-item>
            </b-dd>
            <b-dd variant="outline-dark" text="Import/Export Users">
              <b-dd-item v-b-modal.import-students-file href="#">Add Students from a File</b-dd-item>
              <b-dd-item v-b-modal.import-students-manually href="#">Add Students Manually</b-dd-item>
              <b-dd-item href="#">Export Students to a File</b-dd-item>
            </b-dd>
            <b-select>
              <option default value="10">Show 10 rows</option>
              <option value="25">Show 25 rows</option>
              <option value="50">Show 50 rows</option>
              <option value="0">Show all rows</option>
            </b-select>
          </b-btn-group>
        </b-col>
      </b-row>
      <b-row>
        <b-table :items="users.models" :fields="fields" :small="true" :bordered="true"
        primary-key="set_id" selectable>

        <!-- A custom formatted column -->
        <template slot="email_address" slot-scope="data">
          <a :href="data.value">Email</a>
        </template>
      </b-table>
    </b-row>
  </b-container>
  <import-students-file />
  <import-students-manually />
</div>
</template>



<script>
// components
import ImportStudentsFile from './view_components/ImportStudentsFile.vue'
import ImportStudentsManually from './view_components/ImportStudentsManually.vue'

// models
import UserList from '../../models/UserList.js'


export default {
  name: 'ClasslistManager',
  data: function () {
      return {
        fields: [
          { key: 'user_id', sortable: true, label: "Login"},
          { key: 'first_name', sortable: true,label: "First Name"},
          { key: 'last_name', sortable: true, label: "Last Name"},
          { key: 'email_address', sortable: false, label: "Email"},
          { key: 'student_id', sortable: true, label: "Student ID"},
          { key: 'status', sortable: true,formatter: "formatUserType"},
          { key: 'section', sortable: true, label: "Sect."},
          { key: 'recitation', sortable: true, label: "Rec."},
          { key: 'comment', sortable: true, label: "Comment"},
          { key: 'permission', sortable: true, label: "Permission", formatter: "formatPermission"}
        ],
        user_types: {
          'C': "enrolled",
          'P': "proctor",
          'A': "audit",
          'D': "drop"
        },
        permission_levels: {
          20: "admin",
          10: "professor",
          0: "student",
          "-5": "guest"
        }
    }
  },
  components: {
    ImportStudentsFile,
    ImportStudentsManually
  },
  props: {
    users: UserList
  },
  watch: {
    users: function() {
      // eslint-disable-next-line
      console.log(this.users);
    }
  },
  methods: {
    formatUserType: function (value) { return this.user_types[value]},
    formatPermission: function(value) { return this.permission_levels[value]}
  }
}




</script>

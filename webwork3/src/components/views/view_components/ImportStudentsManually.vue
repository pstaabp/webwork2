<template>
  <b-modal size="xl" id="import-students-manually" ref="addstudmodal" title="Import Students Manually">
    <b-container fluid>
      <b-row>
        <table class="table sm">
          <thead>
            <th>User ID</th><th>First Name</th><th>Last Name</th>
            <th>Email</th><th>Student ID</th><th>Stat.</th>
            <th>Sect.</th><th>Rec.</th><th>Comment</th><th>Permission</th>
          </thead>
          <tbody>
            <tr v-for="i in num_students" :key="students[i-1].user_id">
              <td><b-input size="sm" v-model="students[i-1].user_id" /></td>
              <td><b-input size="sm" v-model="students[i-1].first_name" /></td>
              <td><b-input size="sm" v-model="students[i-1].last_name" /></td>
              <td><b-input size="sm" v-model="students[i-1].email_address" type="email" /></td>
              <td><b-input size="sm" v-model="students[i-1].student_id" /></td>
              <td><b-input size="sm" v-model="students[i-1].status" /></td>
              <td><b-input size="sm" v-model="students[i-1].section" /></td>
              <td><b-input size="sm" v-model="students[i-1].recitation" /></td>
              <td><b-input size="sm" v-model="students[i-1].comment" /></td>
              <td><b-input size="sm" v-model="students[i-1].permission" /></td>
            </tr>
          </tbody>
        </table>
      </b-row>
    </b-container>
    <div slot="modal-footer" class="w-100">
      <b-btn-group size="sm" class="float-right">
        <b-btn variant="outline-dark" @click="cancel">Cancel</b-btn>
        <b-btn variant="primary" @click="addAll">Add Students</b-btn>
      </b-btn-group>
     </div>
  </b-modal>
</template>



<script>
import User from '../../../models/User.js'
export default {
  name: 'ImportStudentsFile',
  data: function() {
    return {
      num_students: 1,
      students: [new User()]
    }
  },
  methods: {
    cancel() {this.$refs.addstudmodal.hide()},
    addAll() {
       // eslint-disable-next-line
        console.log(this.data);

    }
  }
}
</script>

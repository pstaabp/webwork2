<template>
  <b-modal size="xl" id="edit-users-modal" title="Edit Selected Users"
      ok-title="Save and Close" @ok="save">
    <b-container fluid>
      <table class="table table-sm">
        <thead>
          <th>Login Name</th>
          <th>First Name</th>
          <th>Last Name</th>
          <th>Email</th>
          <th>Student ID</th>
          <th>Status</th>
          <th>Sect.</th>
          <th>Rec.</th>
          <th>Comment</th>
          <th>Permission</th>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user.user_id" >
            <td>{{user.user_id}}</td>
            <td><b-input size="sm" v-model="user.first_name" /></td>
            <td><b-input size="sm" v-model="user.last_name" /></td>
            <td><b-input type="email" size="sm" v-model="user.email_address" /></td>
            <td><b-input size="sm" v-model="user.student_id" /></td>
            <td><b-input size="sm" v-model="user.status" /></td>
            <td><b-input size="sm" v-model="user.section" /></td>
            <td><b-input size="sm" v-model="user.recitation" /></td>
            <td><b-input size="sm" v-model="user.comment" /></td>
            <td><b-input size="sm" v-model="user.permission" /></td>
          </tr>
        </tbody>
      </table>
    </b-container>
  </b-modal>
</template>



<script>


export default {
  name: 'EditUsers',
  props: {
    users: Array
  },
  methods: {
    save(){
      this.users.forEach( _user => this.$store.dispatch("updateUser",_user))
      this.$bvModal.hide('edit-users-modal')
    }
  }
}
</script>

<script lang="ts">
import { Vue, Component, Prop } from "vue-property-decorator";

import { User } from "@/store/models";

import { getModule } from "vuex-module-decorators";

import users_module from "@/store/modules/users";
const users_store = getModule(users_module);

@Component
export default class EditUsersModel extends Vue {
  public name!: "EditUsers";
  @Prop() private users!: User[];

  // constructor() {
  //   super();
  // }

  private save(): void {
    this.users.forEach((_user) => users_store.updateUser(_user));
    this.$bvModal.hide("edit-users-modal");
  }
}
</script>

<template>
  <b-modal
    id="edit-users-modal"
    size="xl"
    title="Edit Selected Users"
    ok-title="Save and Close"
    @ok="save"
  >
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
          <tr v-for="user in users" :key="user.user_id">
            <td>{{ user.user_id }}</td>
            <td><b-input v-model="user.first_name" size="sm" /></td>
            <td><b-input v-model="user.last_name" size="sm" /></td>
            <td>
              <b-input v-model="user.email_address" type="email" size="sm" />
            </td>
            <td><b-input v-model="user.student_id" size="sm" /></td>
            <td><b-input v-model="user.status" size="sm" /></td>
            <td><b-input v-model="user.section" size="sm" /></td>
            <td><b-input v-model="user.recitation" size="sm" /></td>
            <td><b-input v-model="user.comment" size="sm" /></td>
            <td><b-input v-model="user.permission" size="sm" /></td>
          </tr>
        </tbody>
      </table>
    </b-container>
  </b-modal>
</template>

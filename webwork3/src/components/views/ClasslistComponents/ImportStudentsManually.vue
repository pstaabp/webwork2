<!-- ImportStudentsManually.vue

This component is a modal that imports students manually (typing in individually).  -->

<script lang="ts">
import { User } from "@/store/models";

import { Vue, Component } from "vue-property-decorator";
@Component({
  name: "ImportStudentsFiles",
})
export default class ImportStudentsFile extends Vue {
  private num_students = 0;
  private users: User[] = [];

  private addAll() {
    console.log(this.users); // eslint-disable-line no-console
  }
}
</script>

<template>
  <b-modal
    id="import-students-manually"
    ref="addstudmodal"
    size="xl"
    title="Import Students Manually"
  >
    <b-container fluid>
      <b-row>
        <table class="table sm">
          <thead>
            <th>User ID</th>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Email</th>
            <th>Student ID</th>
            <th>Stat.</th>
            <th>Sect.</th>
            <th>Rec.</th>
            <th>Comment</th>
            <th>Permission</th>
          </thead>
          <tbody>
            <tr v-for="i in num_students" :key="users[i - 1].get('user_id')">
              <td>
                <b-input size="sm" :value="users[i - 1].get('user_id')" />
              </td>
              <td>
                <b-input size="sm" :value="users[i - 1].get('first_name')" />
              </td>
              <td>
                <b-input size="sm" :value="users[i - 1].get('last_name')" />
              </td>
              <td>
                <b-input
                  size="sm"
                  :value="users[i - 1].get('email_address')"
                  type="email"
                />
              </td>
              <td>
                <b-input size="sm" :value="users[i - 1].get('student_id')" />
              </td>
              <td>
                <b-input size="sm" :value="users[i - 1].get('status')" />
              </td>
              <td>
                <b-input size="sm" :value="users[i - 1].get('section')" />
              </td>
              <td>
                <b-input size="sm" :value="users[i - 1].get('recitation')" />
              </td>
              <td>
                <b-input size="sm" :value="users[i - 1].get('comment')" />
              </td>
              <td>
                <b-input size="sm" :value="users[i - 1].get('permission')" />
              </td>
            </tr>
          </tbody>
        </table>
      </b-row>
    </b-container>
    <template #modal-footer>
      <div class="w-100">
        <b-btn-group size="sm" class="float-right">
          <b-btn
            variant="outline-dark"
            @click="$bvModal.hide('import-students-manually')"
          >
            Cancel
          </b-btn>
          <b-btn variant="primary" @click="addAll">Add Students</b-btn>
        </b-btn-group>
      </div>
    </template>
  </b-modal>
</template>

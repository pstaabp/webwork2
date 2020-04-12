<!-- ClasslistManager.vue

View for the classlist manager, which handles all users in a course -->

<script lang="ts">
import { Vue, Component } from "vue-property-decorator";

// components
import ImportStudentsFile from "./ClasslistComponents/ImportStudentsFile.vue";
import ImportStudentsManually from "./ClasslistComponents/ImportStudentsManually.vue";
import ExportStudents from "./ClasslistComponents/ExportStudents.vue";
import EditUsersModal from "./ClasslistComponents/EditUsersModal.vue";
import { permissionLevels, userTypes } from "@/common";
import { User } from "@/store/models";

// set up the store
import users_store from "@/store/modules/users";

@Component({
  name: "ClasslistManager",
  components: {
    ImportStudentsFile,
    ImportStudentsManually,
    EditUsersModal,
    ExportStudents,
  },
})
export default class Manager extends Vue {
  private fields = [
    { key: "user_id", sortable: true, label: "Login" },
    { key: "first_name", sortable: true, label: "First Name" },
    { key: "last_name", sortable: true, label: "Last Name" },
    { key: "email_address", sortable: false, label: "Email" },
    { key: "student_id", sortable: true, label: "Student ID" },
    { key: "status", sortable: true, formatter: "formatStatus" },
    { key: "section", sortable: true, label: "Sect." },
    { key: "recitation", sortable: true, label: "Rec." },
    { key: "comment", sortable: true, label: "Comment" },
    {
      key: "permission",
      sortable: true,
      label: "Permission",
      formatter: "formatPermission",
    },
  ];
  private selected_users: object[] = [];
  private filter_string = "";
  private num_rows = 10;
  private current_page = 1;

  private formatStatus(value: string): string {
    return userTypes()[value];
  }

  private formatPermission(value: string): string {
    return permissionLevels()[value];
  }

  private rowSelected(rows: User[]): void {
    this.selected_users = rows;
  }

  get users(): User[] {
    return Array.from(users_store.users.values());
  }

  private editRow(item: User) {
    console.log(item); // eslint-disable-line no-console
    this.selected_users = [item];
  }
}
</script>

<template>
  <div>
    <b-container>
      <b-row class="pb-3">
        <b-col cols="3">
          <b-btn-toolbar>
            <b-input-group size="sm">
              <b-input v-model="filter_string" placeholder="Filter" />
              <template #append>
                <b-btn @click="filter_string = ''"><b-icon icon="x" /></b-btn>
              </template>
            </b-input-group>
          </b-btn-toolbar>
        </b-col>
        <b-col cols="3" />
        <b-col cols="6">
          <b-btn-group size="sm">
            <b-dd variant="outline-dark" text="Action on Selected">
              <b-dd-item href="#">Email Users</b-dd-item>
              <b-dd-item v-b-modal.edit-users-modal>Edit Users</b-dd-item>
              <b-dd-item href="#">Delete Users</b-dd-item>
            </b-dd>
            <b-dd variant="outline-dark" text="Import/Export Users">
              <b-dd-item v-b-modal.import-students-file href="#">
                Add Students from a File
              </b-dd-item>
              <b-dd-item v-b-modal.import-students-manually href="#">
                Add Students Manually
              </b-dd-item>
              <b-dd-item v-b-modal.export-students href="#">
                Export Students to a File
              </b-dd-item>
            </b-dd>
            <b-select v-model="num_rows">
              <option default value="10">Show 10 rows</option>
              <option value="25">Show 25 rows</option>
              <option value="50">Show 50 rows</option>
              <option value="0">Show all rows</option>
            </b-select>
          </b-btn-group>
        </b-col>
      </b-row>
      <b-row>
        <b-table
          :items="users"
          :fields="fields"
          :small="true"
          :bordered="true"
          primary-key="set_id"
          :filter="filter_string"
          :current-page="current_page"
          :per-page="num_rows"
          selectable
          @row-selected="rowSelected"
        >
          <!-- A custom formatted column -->
          <template #email_address="data">
            <a :href="data.value">Email</a>
          </template>
        </b-table>
      </b-row>
      <b-row>
        <b-col>
          <b-pagination
            v-model="current_page"
            limit="10"
            :total-rows="users.length"
            :per-page="num_rows"
          />
        </b-col>
      </b-row>
    </b-container>
    <edit-users-modal :users="selected_users" />
    <import-students-file />
    <import-students-manually />
    <export-students />
  </div>
</template>

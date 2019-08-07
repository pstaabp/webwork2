<template>
  <div>
    <b-container>
      <b-row class="pb-3">
        <b-col cols="3">
          <b-btn-toolbar>
            <b-input-group size="sm">
              <b-input placeholder="Filter" v-model="filter_string"/>
            </b-input-group>
            <b-btn-group size="sm">
              <b-btn variant="outline-dark" @click="filter_string=''">X</b-btn>
            </b-btn-group>
          </b-btn-toolbar>
        </b-col>
        <b-col cols="3">
        </b-col>
        <b-col cols="6">
          <b-btn-group size="sm" >
            <b-dd variant="outline-dark" text="Action on Selected">
              <b-dd-item href="#">Email Users</b-dd-item>
              <b-dd-item v-b-modal.edit-users-modal>Edit Users</b-dd-item>
              <b-dd-item href="#">Delete Users</b-dd-item>
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
        <b-table :items="users" :fields="fields" :small="true" :bordered="true"
          primary-key="set_id" @row-selected="rowSelected" :filter="filter_string"
          :current-page="current_page" :per-page="per_page" selectable>
        <!-- A custom formatted column -->
        <template slot="email_address" slot-scope="data">
          <a :href="data.value">Email</a>
        </template>
      </b-table>
    </b-row>
    <b-row>
      <b-col>
        <b-pagination  v-model="current_page" limit="10"
          :total-rows="users.length" :per-page="per_page" />
      </b-col>
    </b-row>
  </b-container>
  <edit-users-modal :users="selected_users"/>
  <import-students-file />
  <import-students-manually />
</div>
</template>



<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';


// components
import ImportStudentsFile from './ClasslistComponents/ImportStudentsFile.vue';
import ImportStudentsManually from './ClasslistComponents/ImportStudentsManually.vue';
import EditUsersModal from './ClasslistComponents/EditUsersModal.vue';
import Constants from '@/Constants';
import User from '@/models/User';

// set up the store
import { getModule } from 'vuex-module-decorators';
import WeBWorKStore from '@/store';
const store = getModule(WeBWorKStore);


@Component({
  name: 'ClasslistManager',
  components: {
    ImportStudentsFile,
    ImportStudentsManually,
    EditUsersModal,
  },
})
export default class Manager extends Vue {
  private fields =  [
          { key: 'user_id', sortable: true, label: 'Login'},
          { key: 'first_name', sortable: true, label: 'First Name'},
          { key: 'last_name', sortable: true, label: 'Last Name'},
          { key: 'email_address', sortable: false, label: 'Email'},
          { key: 'student_id', sortable: true, label: 'Student ID'},
          { key: 'status', sortable: true, formatter: 'formatStatus'},
          { key: 'section', sortable: true, label: 'Sect.'},
          { key: 'recitation', sortable: true, label: 'Rec.'},
          { key: 'comment', sortable: true, label: 'Comment'},
          { key: 'permission', sortable: true, label: 'Permission', formatter: 'formatPermission'},
        ];
  private selected_users: object[] = [];
  private filter_string = '';
  private per_page = 10;
  private current_page = 1;

  private formatStatus(value: string): string {
    return Constants.userTypes()[value];
  }

  private formatPermission(value: string): string {
    return Constants.permissionLevels()[value];
  }

  private rowSelected(rows: object[]): void {
    this.selected_users = rows;
  }

  get users(): object[] {
    return store.users.models().map( (_u) => _u.getAttributes());
  }

}
</script>

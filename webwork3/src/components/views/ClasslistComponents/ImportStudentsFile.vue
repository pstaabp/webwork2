<!-- ImportStudentFile

  This compontent is used to import students from a CSV file.

-->

<script lang="ts">
import { Vue, Component, Watch } from "vue-property-decorator";
import { parse } from "papaparse";

import { newUser } from "@/common";
import { User } from "@/store/models";

interface ResultType {
  [index: string]: { message: string };
}

interface HeaderType {
  value: string;
  text: string;
  regexp: string;
}

@Component
export default class ImportStudentsFile extends Vue {
  private file: File = new File([""], "");
  private use_first_row = false;
  private page = 1;
  private numCols = 0;
  private header_values: string[] = [];
  private headers: HeaderType[] = [
    { value: "selected", text: "", regexp: "" },
    { value: "user_id", text: "Login", regexp: "login|user" },
    { value: "first_name", text: "First Name", regexp: "first" },
    { value: "last_name", text: "Last Name", regexp: "last" },
    { value: "email_address", text: "Email", regexp: "email" },
    { value: "student_id", text: "Student ID", regexp: "student" },
    { value: "status", text: "Status", regexp: "status" },
    { value: "section", text: "Sect.", regexp: "section" },
    { value: "recitation", text: "Rec.", regexp: "recitation" },
    { value: "comment", text: "Comment", regexp: "comment" },
    { value: "permission", text: "Permission", regexp: "permission" },
  ];
  private first_row: string[] = [];
  private users: string[][] = [];

  private loadFile() {
    const reader: FileReader = new FileReader();

    reader.readAsText(this.file);
    reader.onload = (evt: ProgressEvent) => {
      if (evt && evt.target) {
        console.log(evt.target); // eslint-disable-line no-console
        const reader = evt.target as FileReader;
        const results = parse(reader.result as string);
        if (results.errors && results.errors.length > 0) {
          alert(results.errors);
        } else {
          this.users = results.data;
        }
      }
    };
  }
  @Watch("use_first_row")
  private useFirstRowChanged() {
    console.log(this.use_first_row); // eslint-disable-line no-console
    if (this.use_first_row) {
      this.first_row = Array.from(this.users[0]);
    }
    const table = document.getElementById("import-table") as HTMLTableElement;
    if (table) {
      table.rows[1].style.visibility = this.use_first_row
        ? "collapse"
        : "visible";
    }

    console.log(this.first_row); // eslint-disable-line no-console
    // try to match the header fields
    this.headers.forEach((header) => {
      console.log(header); // eslint-disable-line no-console
      const re = new RegExp(header.regexp, "i");
      const k = this.first_row.findIndex((h: string) => re.test(h));

      console.log(re); // eslint-disable-line no-console
      if (k > -1) {
        this.header_values[k] = header.value;
      }
    });
  }

  private async addAll() {
    if (this.use_first_row) {
      this.users.shift();
    }

    const users = this.users.map((_u: string[]) =>
      this.header_values.reduce((result: User, _val: string, i: number) => {
        result[_val] = "" + _u[i];
        return result;
      }, newUser())
    );

    console.log(users); // eslint-disable-line no-console
    // await users_store.addUsers(users as User[]);
    this.$bvModal.hide("import-students-file");
  }

  private addSelected() {
    this.$bvModal.hide("import-students-file");
  }
}
</script>

<template>
  <b-modal
    id="import-students-file"
    ref="sfmodal"
    size="xl"
    title="Import Students from a File"
  >
    <b-container fluid>
      <b-row>
        <b-col cols="3">
          <b-form-file
            v-model="file"
            size="sm"
            accept="text/csv"
            :state="Boolean(file)"
            placeholder="Choose a file..."
            drop-placeholder="Drop file here..."
          />
        </b-col>
        <!-- <b-col cols="3">
          <div class="mt-2">Selected file: {{ file ? file.name : "" }}</div>
        </b-col> -->
        <b-col>
          <b-input-group>
            <b-btn variant="outline-dark" size="sm" @click="loadFile">
              Load File
            </b-btn>
            <b-checkbox v-model="use_first_row" class="ml-3">
              Use first row as header
            </b-checkbox>
          </b-input-group>
        </b-col>
      </b-row>
      <b-row v-if="users.length > 0">
        <b-table
          id="import-table"
          selectable
          select-mode="range"
          :items="users"
          :per-page="10"
          :current-page="page"
          small
        >
          <template #cell(selected)="{ rowSelected }">
            <template v-if="rowSelected">
              <span aria-hidden="true">&check;</span>
              <span class="sr-only">Selected</span>
            </template>
            <template v-else>
              <span aria-hidden="true">&nbsp;</span>
              <span class="sr-only">Not selected</span>
            </template>
          </template>

          <template #head()="data">
            <b-select
              v-model="header_values[data.column]"
              :options="headers"
              size="sm"
            />
          </template>
        </b-table>
        <b-pagination
          v-model="page"
          :total-rows="users.length"
          :per-page="10"
          aria-controls="myTable"
        />
      </b-row>
    </b-container>
    <template #modal-footer>
      <div class="w-100">
        <b-btn-group size="sm" class="float-right">
          <b-btn
            variant="outline-dark"
            @click="$bvModal.hide('import-students-file')"
          >
            Cancel
          </b-btn>
          <b-btn variant="outline-dark" @click="addSelected">
            Add Selected Students
          </b-btn>
          <b-btn variant="primary" @click="addAll">Add All Students</b-btn>
        </b-btn-group>
      </div>
    </template>
  </b-modal>
</template>

<style scoped>
thead {
  display: none;
}
th {
  width: 100px;
}
</style>

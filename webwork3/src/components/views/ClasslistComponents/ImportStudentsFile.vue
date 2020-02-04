<template>
  <b-modal
    size="xl"
    id="import-students-file"
    ref="sfmodal"
    title="Import Students from a File"
  >
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
          <div class="mt-2">Selected file: {{ file ? file.name : "" }}</div>
        </b-col>
        <b-col>
          <b-input-group>
            <b-btn variant="outline-dark" size="sm" @click="loadFile"
              >Load File</b-btn
            >
            <b-checkbox
              class="ml-3"
              v-model="ignoreFirstRow"
              @change="useFirstRow"
              >Use first row as header</b-checkbox
            >
          </b-input-group>
        </b-col>
      </b-row>
      <b-row v-if="data != null">
        <b-col v-for="i in numCols" :key="i">
          <b-select
            :options="headers"
            v-model="headerValues[i - 1]"
            size="sm"
          />
        </b-col>
      </b-row>
      <b-row v-if="data != null">
        <b-table
          :items="data"
          :per-page="10"
          :current-page="page"
          small
          id="import-table"
        />

        <b-pagination
          v-model="page"
          :total-rows="data == null ? 0 : data.length"
          :per-page="10"
          aria-controls="myTable"
        />
      </b-row>
    </b-container>
    <div slot="modal-footer" class="w-100">
      <b-btn-group size="sm" class="float-right">
        <b-btn
          variant="outline-dark"
          @click="$bvModal.hide('import-students-file')"
          >Cancel</b-btn
        >
        <b-btn variant="outline-dark" @click="addSelected"
          >Add Selected Students</b-btn
        >
        <b-btn variant="primary" @click="addAll">Add All Students</b-btn>
      </b-btn-group>
    </div>
  </b-modal>
</template>

<script lang="ts">
import { Vue, Component, Prop } from "vue-property-decorator";
import { parse } from "papaparse";
import { readFileSync } from "fs";

@Component
export default class ImportStudentsFile extends Vue {
  private file: Blob = new Blob();
  private useFirstRow: boolean = false;
  private page: number = 1;
  private numCols: number = 0;
  private headerValues: string[] = [];
  private headers: Array<{ value: string; text: string; regexp: string }> = [
    { value: "user_id", text: "Login", regexp: "login|user" },
    { value: "first_name", text: "First Name", regexp: "first" },
    { value: "last_name", text: "Last Name", regexp: "last" },
    { value: "email_address", text: "Email", regexp: "email" },
    { value: "student_id", text: "Student ID", regexp: "student" },
    { value: "status", text: "Status", regexp: "status" },
    { value: "section", text: "Sect.", regexp: "section" },
    { value: "recitation", text: "Rec.", regexp: "recitation" },
    { value: "comment", text: "Comment", regexp: "comment" },
    { value: "permission", text: "Permission", regexp: "permission" }
  ];
  private firstRow: string[] = [];
  private data: any[] = [];

  private loadFile() {
    const reader: FileReader = new FileReader();

    reader.readAsText(this.file);
    reader.onload = (evt?) => {
      if (evt) {
        const file = readFileSync("sample.csv", "utf8");
        // tslint:disable-next-line
        parse(file, { complete: result => console.dir(result.data) }); // eslint-disable-line no-console
        // const users = Papa.parse(evt.target.result);
        // // change this to an array of an object:
        // this.data = users.data.map( (row) => Object.assign(...row.map((v, i) => ({['col' + i]: v}))));
        // this.firstRow = users.data[0];
        // this.numCols = users.data[0].length;
        // this.headerValues = Array.from(Array(this.numCols).keys()).map( () => null);
      }
    };
  }

  private ignoreFirstRow() {
    // document.getElementById('import-table').rows[1].style.visibility = this.useFirstRow ? 'visible' : 'collapse';
    this.useFirstRow = !this.useFirstRow;
    // try to match the header fields
    this.headers.forEach(header => {
      const re = new RegExp(header.regexp, "i");
      const k = this.firstRow.findIndex(h => re.test(h));
      if (k > -1) {
        this.headerValues[k] = header.value;
      }
    });
  }

  private addAll() {
    if (this.useFirstRow) {
      this.data.shift();
    }
    const _users = this.data.map((_u: any) =>
      this.headerValues.reduce(
        (result: { [index: string]: { message: string } }, _val, i) => {
          result[_val] = _u["col" + i];
          return result;
        },
        {}
      )
    );

    _users.forEach((_u: any) => this.$store.dispatch("addUser", _u));
    this.$bvModal.hide("import-students-file");
  }

  private addSelected() {
    this.$bvModal.hide("import-students-file");
  }
}
</script>

<style scoped>
thead {
  display: none;
}
</style>

<!-- LibraryDirectory.vue

This is a tab in the LibraryBrowser that allows one to find problems by directory. -->

<script lang="ts">
import axios from "axios";

import { Vue, Component } from "vue-property-decorator";

interface DirectoryInfo {
  subfields: DirectoryInfo[];
  num_files: number;
  name: string;
}

@Component({
  name: "LibraryDirectory",
})
export default class LibraryDirectory extends Vue {
  private dirs1 = [
    { value: "Library", text: "OPL Directory" },
    { value: "Contrib", text: "Contrib" },
  ];

  private dirs2: string[] = [];
  private dirs3: string[] = [];
  private dirs4: string[] = [];
  private dirs5: string[] = [];
  private dir1 = "";
  private dir2 = "";
  private dir3 = "";
  private dir4 = "";
  private dir5 = "";
  private load_num = 0;
  private OPL: DirectoryInfo[] = [];
  private library: DirectoryInfo[] = [];

  private mounted(): void {
    axios.get("/webwork3/api/library/directories").then((response) => {
      this.OPL = response.data;
    });
  }

  private dir1Change(): void {
    if (this.dir1 === "Library") {
      this.library = this.OPL;
    }
    this.dir2 = this.dir3 = this.dir4 = this.dir5 = "";
    this.dirs3 = this.dirs4 = this.dirs5 = [];
    this.dirs2 = this.library[0].subfields.map((_s) => _s.name);
    this.dirs2.sort();
  }

  private dir2Change(): void {
    this.dir3 = this.dir4 = this.dir5 = "";
    this.dirs4 = this.dirs5 = [];
    const dir2 = this.library[0].subfields.find((_s) => _s.name === this.dir2);
    if (dir2) {
      this.load_num = dir2.num_files;
      this.dirs3 = dir2.subfields.map((_s) => _s.name);
      this.dirs3.sort();
    }
  }

  private dir3Change(): void {
    this.dir4 = this.dir5 = "";
    this.dirs5 = [];
    const dir2 = this.library[0].subfields.find((_s) => _s.name === this.dir2);
    if (dir2) {
      const dir3 = dir2.subfields.find((_s) => _s.name === this.dir3);
      if (dir3) {
        this.load_num = dir3.num_files;
        this.dirs4 = dir3.subfields.map((_s) => _s.name);
        this.dirs4.sort();
      }
    }
  }

  private loadProblems(): void {
    const dir = [this.dir1, this.dir2, this.dir3, this.dir4, this.dir5]
      .filter((_dir) => _dir !== "")
      .join("/");
    axios.get("/webwork3/api/library/directories/" + dir).then((response) => {
      this.$emit("load-problems", response.data);
    });
  }
}
</script>

<template>
  <b-row>
    <b-col>
      <b-select v-model="dir1" size="sm" :options="dirs1" @change="dir1Change">
        <template #first>
          <option :value="null" disabled>
            Select a Library
          </option>
        </template>
      </b-select>
    </b-col>
    <b-col>
      <b-select
        v-if="dirs2.length > 0"
        v-model="dir2"
        size="sm"
        :options="dirs2"
        @change="dir2Change"
      >
        <template #first>
          <option :value="null" disabled>
            Select
          </option>
        </template>
      </b-select>
    </b-col>
    <b-col>
      <b-select
        v-if="dirs3.length > 0"
        v-model="dir3"
        size="sm"
        :options="dirs3"
        @change="dir3Change"
      >
        <template #first>
          <option :value="null" disabled>
            Select
          </option>
        </template>
      </b-select>
    </b-col>
    <b-col>
      <b-select
        v-if="dirs4.length > 0"
        v-model="dir4"
        size="sm"
        :options="dirs4"
        @change="dir4Change"
      />
    </b-col>
    <b-col>
      <b-select
        v-if="dirs5.length > 0"
        v-model="dir5"
        size="sm"
        :options="dirs5"
        @change="dir5Change"
      />
    </b-col>
    <b-col>
      <b-btn
        size="sm"
        variant="outline-dark"
        :disabled="dir2 == null"
        @click="loadProblems"
      >
        Load {{ load_num }} Problems
      </b-btn>
    </b-col>
  </b-row>
</template>

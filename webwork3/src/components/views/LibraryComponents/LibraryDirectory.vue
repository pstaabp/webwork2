<!-- LibraryDirectory.vue

This is a tab in the LibraryBrowser that allows one to find problems by directory. -->

<script>
import axios from "axios";

export default {
  name: "LibraryDirectory",
  data() {
    return {
      dirs1: [
        { value: "Library", text: "OPL Directory" },
        { value: "Contrib", text: "Contrib" },
      ],
      dirs2: [],
      dirs3: [],
      dirs4: [],
      dirs5: [],
      dir1: null,
      dir2: null,
      dir3: null,
      dir4: null,
      dir5: null,
      load_num: 0,
      OPL: [],
    };
  },
  mounted() {
    axios.get("/webwork3/api/library/directories").then((response) => {
      this.OPL = response.data;
    });
  },
  methods: {
    dir1Change() {
      if (this.dir1 === "Library") {
        this.library = this.OPL;
      }
      this.dir2 = this.dir3 = this.dir4 = this.dir5 = null;
      this.dirs3 = this.dirs4 = this.dirs5 = [];
      this.dirs2 = this.library[0].subfields.map((_s) => _s.name);
      this.dirs2.sort();
    },
    dir2Change() {
      this.dir3 = this.dir4 = this.dir5 = null;
      this.dirs4 = this.dirs5 = [];
      const dir2 = this.library[0].subfields.find(
        (_s) => _s.name === this.dir2
      );
      this.load_num = dir2.num_files;
      this.dirs3 = dir2.subfields.map((_s) => _s.name);
      this.dirs3.sort();
    },
    dir3Change() {
      this.dir4 = this.dir5 = null;
      this.dirs5 = [];
      const dir2 = this.library[0].subfields.find(
        (_s) => _s.name === this.dir2
      );
      const dir3 = dir2.subfields.find((_s) => _s.name === this.dir3);
      this.load_num = dir3.num_files;
      if (dir3.subfields !== undefined) {
        this.dirs4 = dir3.subfields.map((_s) => _s.name);
        this.dirs4.sort();
      }
    },
    loadProblems() {
      const dir = [this.dir1, this.dir2, this.dir3, this.dir4, this.dir5]
        .filter((_dir) => _dir !== null)
        .join("/");
      axios.get("/webwork3/api/library/directories/" + dir).then((response) => {
        this.$emit("load-problems", response.data);
      });
    },
  },
};
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

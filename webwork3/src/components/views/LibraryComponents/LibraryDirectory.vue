<template>
  <b-row>
    <b-col>
      <b-select size="sm" :options="dirs1" v-model="dir1" @change="dir1Change">
        <template slot="first">
          <option :value="null" disabled>Select a Library</option>
        </template>
      </b-select>
    </b-col>
    <b-col>
      <b-select
        size="sm"
        :options="dirs2"
        v-model="dir2"
        v-if="dirs2.length > 0"
        @change="dir2Change"
      >
        <template slot="first">
          <option :value="null" disabled>Select</option>
        </template>
      </b-select>
    </b-col>
    <b-col>
      <b-select
        size="sm"
        :options="dirs3"
        v-model="dir3"
        v-if="dirs3.length > 0"
        @change="dir3Change"
      >
        <template slot="first">
          <option :value="null" disabled>Select</option>
        </template>
      </b-select>
    </b-col>
    <b-col>
      <b-select
        size="sm"
        :options="dirs4"
        v-model="dir4"
        v-if="dirs4.length > 0"
        @change="dir4Change"
      />
    </b-col>
    <b-col>
      <b-select
        size="sm"
        :options="dirs5"
        v-model="dir5"
        v-if="dirs5.length > 0"
        @change="dir5Change"
      />
    </b-col>
    <b-col>
      <b-btn
        size="sm"
        variant="outline-dark"
        @click="loadProblems"
        :disabled="dir2 == null"
      >
        Load {{ load_num }} Problems
      </b-btn>
    </b-col>
  </b-row>
</template>

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
      const _dir2 = this.library[0].subfields.find(
        (_s) => _s.name === this.dir2
      );
      this.load_num = _dir2.num_files;
      this.dirs3 = _dir2.subfields.map((_s) => _s.name);
      this.dirs3.sort();
    },
    dir3Change() {
      this.dir4 = this.dir5 = null;
      this.dirs5 = [];
      const _dir2 = this.library[0].subfields.find(
        (_s) => _s.name === this.dir2
      );
      const _dir3 = _dir2.subfields.find((_s) => _s.name === this.dir3);
      this.load_num = _dir3.num_files;
      if (_dir3.subfields !== undefined) {
        this.dirs4 = _dir3.subfields.map((_s) => _s.name);
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

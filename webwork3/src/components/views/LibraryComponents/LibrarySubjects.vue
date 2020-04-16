<template>
  <b-row class="mb-3">
    <b-col>
      <b-select
        v-model="selected_subject"
        :options="subjects"
        value-field="name"
        text-field="name"
        @change="subjectChange"
        size="sm"
      >
        <template slot="first">
          <option :value="''" disabled>Select subject...</option>
        </template>
      </b-select>
    </b-col>
    <b-col>
      <b-select
        v-show="selected_subject != ''"
        v-model="selected_chapter"
        :options="chapters"
        @change="chapterChange"
        value-field="name"
        text-field="name"
        size="sm"
      >
        <template slot="first">
          <option :value="null">Select chapter...</option>
        </template>
      </b-select>
    </b-col>
    <b-col>
      <b-select
        v-show="selected_chapter != ''"
        v-model="selected_section"
        :options="sections"
        value-field="name"
        text-field="name"
        size="sm"
        @change="sectionChange"
      >
        <template slot="first">
          <option :value="null">Select section...</option>
        </template>
      </b-select>
    </b-col>
    <b-col>
      <b-btn size="sm" variant="outline-dark" @click="selectProblems">
        Select {{ num_files }} Problems
      </b-btn>
    </b-col>
  </b-row>
</template>

<script lang="ts">
import axios from "axios";

import { Vue, Component, Prop } from "vue-property-decorator";

interface LibraryInfo {
  subfields: LibraryInfo[];
  num_files: number;
  name: string;
}

@Component({
  name: "LibrarySubjects",
})
export default class LibrarySubjects extends Vue {
  private subjects: LibraryInfo[] = [];
  private chapters: LibraryInfo[] = [];
  private sections: LibraryInfo[] = [];
  private selected_subject: string = "";
  private selected_chapter: string = "";
  private selected_section: string = "";
  private num_files: number = 0;
  private current_page: number = 0;

  private subjectChange(name: string) {
    this.selected_chapter = "";
    this.selected_section = "";
    this.current_page = 0;
    const subjs = this.subjects.find((subj: LibraryInfo) => subj.name === name);
    if (subjs) {
      this.chapters = subjs.subfields;
      this.num_files = subjs.num_files;
    }
  }

  private chapterChange(name: string) {
    this.selected_section = "";
    this.current_page = 0;
    if (name === "") {
      return;
    }
    const chs = this.chapters.find((ch: LibraryInfo) => ch.name === name);
    if (chs) {
      this.sections = chs.subfields;
      this.num_files = chs.num_files;
    }
  }

  private sectionChange(name: string) {
    this.current_page = 0;
    if (name === "") {
      return;
    }
    const sect = this.sections.find(
      (_sect: LibraryInfo) => _sect.name === name
    );
    if (sect) {
      this.num_files = sect.num_files;
    }
  }

  private selectProblems() {
    let url = "/webwork3/api/library/subjects/" + this.selected_subject;
    url +=
      this.selected_chapter !== "" ? "/chapters/" + this.selected_chapter : "";
    url +=
      this.selected_section !== "" ? "/sections/" + this.selected_section : "";
    url += "/problems";
    url = encodeURI(url);

    axios
      .get(url)
      .then((response) => {
        this.$emit("load-problems", response.data);
      })
      .catch((err) => {
        console.log(err); // eslint-disable-line no-console
      });
  }

  private created() {
    axios
      .get("/webwork3/api/library/subjects")
      .then((response) => {
        this.subjects = response.data;
      })
      .catch((err) => {
        console.log(err); // eslint-disable-line no-console
      });
  }
}
</script>

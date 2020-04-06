<!-- LibraryTextbooks.vue

This is a tab in the LibraryBrowser that allows one to find problems by textbook. -->

<script>
import axios from "axios";

export default {
  name: "LibraryTextbooks",
  data() {
    return {
      textbooks: [],
      chapters: [],
      sections: [],
      textbook: null,
      chapter: null,
      section: null,
      textbook_data: [],
      num_files: 0,
    };
  },
  watch: {
    textbook() {
      const textbook = this.textbook_data.find(
        (_tb) => _tb.textbook_id === this.textbook
      );
      this.chapters = textbook.subfields.map((_ch) => ({
        text: _ch.name,
        value: _ch.chapter_id,
      }));
      this.num_files = textbook.num_files;
      this.chapter = this.section = null;
    },
    chapter() {
      const textbook = this.textbook_data.find(
        (_tb) => _tb.textbook_id === this.textbook
      );
      this.chapters = textbook.subfields.map((_ch) => ({
        text: _ch.name,
        value: _ch.chapter_id,
      }));
      const chapter = textbook.subfields.find(
        (_ch) => _ch.chapter_id === this.chapter
      );
      if (chapter) {
        this.sections = chapter.subfields.map((_sect) => ({
          text: _sect.name,
          value: _sect.section_id,
        }));
        this.num_files = chapter.num_files;
      }
      this.section = null;
    },
  },
  mounted() {
    axios.get("/webwork3/api/library/textbooks").then((response) => {
      this.textbook_data = response.data;
      this.textbooks = this.textbook_data.map((_tb) => ({
        value: _tb.textbook_id,
        text: _tb.name,
      }));
    });
  },
  methods: {
    loadProblems: () => {
      let url = "/webwork3/api/library/textbooks/";
      if (this.section) {
        url += "sections/" + this.section + "/problems";
      } else if (this.chapter) {
        url += "chapters/" + this.chapter + "/problems";
      } else {
        url += this.textbook + "/problems";
      }
      axios.get(url).then((response) => {
        this.$emit("load-problems", response.data);
      });
    },
  },
}; // export default
</script>

<template>
  <b-row>
    <b-col>
      <b-select v-model="textbook" size="sm" :options="textbooks">
        <template #first>
          <option :value="null" disabled>
            Select a Textbook...
          </option>
        </template>
      </b-select>
    </b-col>
    <b-col>
      <b-select
        v-if="chapters.length > 0"
        v-model="chapter"
        size="sm"
        :options="chapters"
      >
        <template #first>
          <option :value="null" disabled>
            Select Chapter...
          </option>
        </template>
      </b-select>
    </b-col>
    <b-col>
      <b-select
        v-if="sections.length > 0"
        v-model="section"
        size="sm"
        :options="sections"
      >
        <template #first>
          <option :value="null" disabled>
            Select Section...
          </option>
        </template>
      </b-select>
    </b-col>
    <b-col>
      <b-btn
        size="sm"
        variant="outline-dark"
        :disabled="textbook == null"
        @click="loadProblems"
      >
        Load {{ num_files }} Problems
      </b-btn>
    </b-col>
  </b-row>
</template>

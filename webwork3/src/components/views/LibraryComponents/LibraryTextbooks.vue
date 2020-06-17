<!-- LibraryTextbooks.vue

This is a tab in the LibraryBrowser that allows one to find problems by textbook. -->

<script lang="ts">
import axios from "axios";

import { Vue, Component, Watch } from "vue-property-decorator";

interface Section {
  section_id: number;
  name: string;
}

interface Chapter {
  chapter_id: number;
  name: string;
  subfields: Section[];
  num_files: number;
}

interface Textbook {
  textbook_id: number;
  name: string;
  subfields: Chapter[];
  num_files: number;
}

interface Select {
  text: string;
  value: string | number;
}

@Component({
  name: "LibraryTextbooks",
})
export default class LibraryTextbooks extends Vue {
  private textbooks: Select[] = [];
  private chapters: Select[] = [];
  private sections: Select[] = [];
  private textbook = 0;
  private chapter = 0;
  private section = 0;
  private textbook_data: Textbook[] = [];
  private num_files = 0;

  @Watch("textbook")
  private textbookChanged() {
    const textbook = this.textbook_data.find(
      (_tb) => _tb.textbook_id === this.textbook
    );
    if (textbook) {
      this.chapters = textbook.subfields.map((_ch) => ({
        text: _ch.name,
        value: _ch.chapter_id,
      }));
      this.num_files = textbook.num_files;
      this.chapter = this.section = 0;
    }
  }

  @Watch("chapter")
  private chapterChanged() {
    const textbook = this.textbook_data.find(
      (_tb) => _tb.textbook_id === this.textbook
    );
    if (textbook) {
      this.chapters = textbook.subfields.map((_ch: Chapter) => ({
        text: _ch.name,
        value: _ch.chapter_id,
      }));
      const chapter = textbook.subfields.find(
        (_ch) => _ch.chapter_id === this.chapter
      );
      if (chapter) {
        this.sections = chapter.subfields.map((_sect: Section) => ({
          text: _sect.name,
          value: _sect.section_id,
        }));
        this.num_files = chapter.num_files;
      }
      this.section = 0;
    }
  }

  private mounted() {
    axios.get("/webwork3/api/library/textbooks").then((response) => {
      this.textbook_data = response.data;
      this.textbooks = this.textbook_data.map((_tb) => ({
        value: _tb.textbook_id,
        text: _tb.name,
      }));
    });
  }

  private loadProblems() {
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
  }
}
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

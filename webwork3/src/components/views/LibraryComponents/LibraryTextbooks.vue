<template>
  <b-row>
    <b-col>
      <b-select size="sm" :options="textbooks" v-model="textbook">
        <template slot="first">
          <option :value="null" disabled>Select a Textbook...</option>
        </template>
      </b-select>
    </b-col>
    <b-col>
      <b-select size="sm"  :options="chapters" v-model="chapter" v-if="chapters.length > 0">
        <template slot="first"><option :value="null" disabled>Select Chapter...</option></template>
      </b-select>
    </b-col>
    <b-col>
      <b-select size="sm"  :options="sections" v-model="section" v-if="sections.length > 0">
        <template slot="first"><option :value="null" disabled>Select Section...</option></template>
      </b-select>
    </b-col>
    <b-col>
      <b-btn size="sm" variant="outline-dark" @click="loadProblems"
        :disabled="textbook == null">Load {{num_files}} Problems</b-btn>
    </b-col>
  </b-row>
</template>


<script>
import axios from 'axios';

export default {
  name: 'LibraryTextbooks',
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
      const _textbook = this.textbook_data.find( (_tb) => _tb.textbook_id === this.textbook);
      this.chapters = _textbook.subfields.map( (_ch) => ({ text: _ch.name, value: _ch.chapter_id}));
      this.num_files = _textbook.num_files;
      this.chapter = this.section = null;
    },
    chapter() {
      const _textbook = this.textbook_data.find( (_tb) => _tb.textbook_id === this.textbook);
      this.chapters = _textbook.subfields.map( (_ch) => ({ text: _ch.name, value: _ch.chapter_id}));
      const _chapter = _textbook.subfields.find( (_ch) => _ch.chapter_id === this.chapter);
      if (_chapter) {
        this.sections = _chapter.subfields.map( (_sect) => ({text: _sect.name, value: _sect.section_id}));
        this.num_files = _chapter.num_files;
      }
      this.section = null;
    },
  },
  methods: {
    loadProblems: () =>  {
      let url = '/webwork3/api/library/textbooks/';
      if (this.section) {
        url += 'sections/' + this.section + '/problems';
      } else if (this.chapter) {
        url += 'chapters/' + this.chapter + '/problems';
      } else {
        url += this.textbook + '/problems';
      }
      axios.get(url)
        .then( (response) => {
          this.$emit('load-problems', response.data);
        });
    },
  },
  mounted() {
    axios.get('/webwork3/api/library/textbooks')
      .then( (response) => {
        this.textbook_data = response.data;
        this.textbooks = this.textbook_data.map( (_tb) => ({value: _tb.textbook_id, text: _tb.name}));
      });
  },
}; // export default
</script>

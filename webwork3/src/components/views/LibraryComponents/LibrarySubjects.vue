<template>
  <b-row  class="mb-3">
    <b-col>
      <b-select v-model="selected_subject" :options="subjects" value-field="name" text-field="name"
          @change="subjectChange" size="sm">
        <template slot="first">
          <option :value="null" disabled>Select subject...</option>
        </template>
      </b-select>
    </b-col>
    <b-col>
      <b-select v-show="selected_subject!=null" v-model="selected_chapter" :options="chapters"
      @change="chapterChange" value-field="name" text-field="name" size="sm">
        <template slot="first">
          <option :value="null">Select chapter...</option>
        </template>
      </b-select>
    </b-col>
    <b-col>
      <b-select v-show="selected_chapter!=null" v-model="selected_section" :options="sections"
      value-field="name" text-field="name" size="sm" @change="sectionChange">
        <template slot="first">
          <option :value="null">Select section...</option>
        </template>
      </b-select>
    </b-col>
    <b-col>
      <b-btn size="sm" variant="outline-dark" @click="selectProblems">Select {{num_files}} Problems</b-btn>
    </b-col>
  </b-row>
</template>



<script>
import axios from 'axios'

export default {
  name: 'LibrarySubjects',
  data: function () {
    return {
      subjects: [],
      chapters: [],
      sections: [],
      selected_subject: null,
      selected_chapter: null,
      selected_section: null,
      num_files: "",
    }
  },
  methods: {
    subjectChange: function(name){
      this.selected_chapter = null;
      this.selected_section = null;
      this.current_page = 0;
      const subjs = this.subjects.find(subj => subj.name==name);
      this.chapters = subjs.subfields;
      this.num_files = subjs.num_files;
    },
    chapterChange: function(name){
      this.selected_section = null
      this.current_page = 0;
      if(name == null) {
        return;
      }
      const chs = this.chapters.find(ch => ch.name==name);
      this.sections = chs.subfields;
      this.num_files = chs.num_files;
    },
    sectionChange: function(name){
      this.current_page = 0;
      if(name == null) {
        return;
      }
      const sect = this.sections.find(s => s.name==name)
      this.num_files = sect.num_files;
    },
    selectProblems: function(){
      var url = "/webwork3/api/library/subjects/" + this.selected_subject;
      url += (this.selected_chapter != null) ?  "/chapters/" + this.selected_chapter : ''
      url += (this.selected_section != null) ?  "/sections/" + this.selected_section : ''
      url += "/problems"
      url = encodeURI(url);

      axios.get(url).then(resp => {
        this.$emit('load-problems',resp.data);
      }).catch(err => {
        // eslint-disable-next-line
        console.log(err);
      });
    }
  },
  watch: {
    view_problems: function(){
      // eslint-disable-next-line
      console.log(this.view_problems);
    }
  },
  created: function() {
    axios.get('/webwork3/api/library/subjects')
          .then(response => (this.subjects = response.data))
          .catch(err =>  {
            // eslint-disable-next-line
            console.log(err);
          });
  }
}
</script>

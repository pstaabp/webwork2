<template>
  <div>
    <calendar v-if="current_view=='calendar'" :problem_sets="problem_sets"/>
    <classlist-manager v-else-if="current_view=='classlist_manager'" :users="users" />
    <set-details v-else-if="current_view=='problem_set_details'" :problem_sets="problem_sets"/>
    <library-browser v-else-if="current_view=='library'" :problem_sets="problem_sets"
      :selected_set_id="selected_set_id"/>
    <problem-sets-manager v-else-if="current_view=='problem_sets_manager'" :problem_sets="problem_sets"/>
    <settings-view  :settings="settings" v-else-if="current_view=='settings'" />
  </div>
</template>

<script>

// main views
import Calendar from './components/views/Calendar.vue'
import SetDetails from './components/views/SetDetails.vue'

import ProblemSetsManager from './components/views/ProblemSetsManager.vue'
import LibraryBrowser from './components/views/LibraryBrowser.vue'
import ClasslistManager from './components/views/ClasslistManager.vue'
import Settings from './components/views/Settings.vue'

export default {
  name: 'app',
  props: {
    params: Object
  },
  components: {
    Calendar,
    ClasslistManager,
    SetDetails,
    Settings,
    ProblemSetsManager,
    LibraryBrowser
  },
  data: function () {
    return { views: [
        {name: "Calendar", icon: "fa-calendar", comp: "calendar"},
        {name: "Classlist Manager", icon: "fa-users", comp: "classlist_manager"},
        {name: "Problem Set Details", icon: "fa-info-circle", comp: "problem_set_details"},
        {name: "Library Browser", icon: "fa-university", comp: "library"},
        {name: "Problem Sets Manager", icon: "fa-list-alt", comp: "problem_sets_manager"},
        {name: "Problem Editor", icon: "fa-edit", comp: "editor"},
        {name: "Student Progress", icon: "fa-chart-bar", comp: "statistics"},
        {name: "Import/Export Sets", icon: "fa-exchange-alt", comp: "import_export"},
        {name: "Settings", icon: "fa-cogs", comp: "settings"}
      ],
      sidebars: [
        {name: "Problem Sets", comp: "problem_sets"},
        {name: "Library Options", comp: "lib_opts"},
        {name: "Messages", comp: "messages"}
      ],
      current_view: "calendar",
      current_sidebar: "lib_opts",
      show_sidebar: false,
      problem_sets: null,
      selected_set_id: "",
      user: {user_id: "peter", first_name: "Peter", last_name: "Staab"},
      users: null,
      settings: null,
    }
  },
  created: function() { // load all of the relevant data
    this.$store.dispatch('setLoginInfo',{course_id: this.params.course_id})
    this.$store.dispatch('fetchSettings')
    this.$store.dispatch('fetchUsers')
    this.$store.dispatch('fetchProblemSets')
  },
  filters: {
    getName: (comp,arr) => arr.find(obj=>obj.comp==comp).name
  },
  methods: {
    changeView: function(comp) {
      this.current_view = comp},
    changeSidebar: function(comp){this.current_sidebar = comp;}
  },
  watch: {
    selected_set_id: function(){
      // eslint-disable-next-line
      console.log(this.selected_set_id)
    }
  },
  mounted: function() {    // this is all a hack to get MathJax loaded.  Eventually this need to just be imported.
    if (document.getElementById('mathjax-scr')) return; // was already loaded
    var scriptTag = document.createElement("script");
    scriptTag.src = "https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.5/MathJax.js?config=TeX-MML-AM_CHTML";
    scriptTag.id = "mathjax-scr";
    document.getElementsByTagName('head')[0].appendChild(scriptTag);
  }
}
</script>

<style>
#sidebar {
  background-color: rgb(240,240,240)
}
</style>

<template>
  <div id="app">
    <b-container>
      <MenuBar :views="views" :current_view="current_view" @change-view="changeView" :user="user"
                :sidebars="sidebars" :current_sidebar="current_sidebar" @change-sidebar="changeSidebar"
                @show-hide-sidebar="show_sidebar = !show_sidebar"/>
      <b-row>
        <b-col :cols="show_sidebar ? 9 : 12"  id="leftpane">
          <calendar v-if="current_view=='calendar'" :problem_sets="problem_sets"/>
          <classlist-manager v-else-if="current_view=='classlist_manager'" :users="users" />
          <set-details v-else-if="current_view=='problem_set_details'" :problem_sets="problem_sets"/>
          <library-browser v-else-if="current_view=='library'" :problem_sets="problem_sets"
            :selected_set_id="selected_set_id"/>
          <problem-sets-manager v-else-if="current_view=='problem_sets_manager'" :problem_sets="problem_sets"/>
          <settings-view  :settings="settings" v-else-if="current_view=='settings'" />
        </b-col>
        <b-col v-if="show_sidebar" cols="3" id="sidebar" class="border border-secondary rounded bg-light">
          <h3 style="text-align: center" class="m-3">{{ current_sidebar | getName(sidebars) }}</h3>
          <problem-sets-sidebar v-if="current_sidebar=='problem_sets'" :problem_sets="problem_sets"/>
          <library-options-sidebar v-else-if="current_sidebar=='lib_opts'" :problem_sets="problem_sets"
              :selected_set_id="selected_set_id" v-on:update:selected_set_id="selected_set_id = $event"/>
        </b-col>
      </b-row>
    </b-container>
  </div>
</template>

<script>
import MenuBar from './components/MenuBar.vue'

// models
import User from './models/User.js'
import UserList from './models/UserList.js'
import ProblemSetList from './models/ProblemSetList.js'
import SettingList from './models/SettingList.js'

// sidebars
import ProblemSetsSidebar from './components/sidebars/ProblemSetsSidebar.vue'
import LibraryOptionsSidebar from './components/sidebars/LibraryOptionsSidebar.vue'

// main views
import Calendar from './components/views/Calendar.vue'
import SetDetails from './components/views/SetDetails.vue'

import ProblemSetsManager from './components/views/ProblemSetsManager.vue'
import LibraryBrowser from './components/views/LibraryBrowser.vue'
import ClasslistManager from './components/views/ClasslistManager.vue'
import SettingsView from './components/views/SettingsView.vue'

export default {
  name: 'app',
  components: {
    MenuBar,
    Calendar,
    ClasslistManager,
    SetDetails,
    SettingsView,
    ProblemSetsManager,
    LibraryBrowser,
    ProblemSetsSidebar,
    LibraryOptionsSidebar
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
      current_view: "settings",
      current_sidebar: "lib_opts",
      show_sidebar: false,
      problem_sets: new ProblemSetList(),
      selected_set_id: "",
      user: new User(),
      users: new UserList(),
      settings: new SettingList()
    }
  },
  created: function() { // load all of the relevant data
    var self = this;
    this.problem_sets.fetch().then( response => {
      self.problem_sets = new ProblemSetList({models: response.response.data});
    });
    this.users.fetch().then(response => {
      self.users = new UserList({models: response.response.data});
      // eslint-disable-next-line
      console.log(self.users);
    })
    this.user.user_id = "peter";
    this.user.fetch().then(response => {
      self.user = new User(response.response.data);
    })
    this.settings.fetch().then(response => {
      self.settings = new SettingList(response.response.data);
    })
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

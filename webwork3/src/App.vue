<template>
  <div id="app">
    <menu-bar :views="views" :current_view="current_view"  :user="user"
              :sidebars="sidebars" :current_sidebar="current_sidebar"
              @change-view="current_view = $evt"
              @show-hide-sidebar="show_sidebar = !show_sidebar"/>
    <router-view> </router-view>
    <!-- <b-container>
      <menu-bar :views="views" :current_view="current_view"  :user="user"
                :sidebars="sidebars" :current_sidebar="current_sidebar"
                @show-hide-sidebar="show_sidebar = !show_sidebar"/>
      <b-row>
        <b-col :cols="show_sidebar ? 9 : 12"  id="leftpane">
          <router-view />
        </b-col>
        <b-col v-if="show_sidebar" cols="3" id="sidebar" class="border border-secondary rounded bg-light">
          <h3 style="text-align: center" class="m-3">{{ current_sidebar | getName(sidebars) }}</h3>
          <problem-sets-sidebar v-if="current_sidebar=='problem_sets'" :problem_sets="problem_sets"/>
          <library-options-sidebar v-else-if="current_sidebar=='lib_opts'" :problem_sets="problem_sets"
              :selected_set_id="selected_set_id" @update:selected_set_id="selected_set_id = $event"/>
        </b-col>
      </b-row>
    </b-container> -->
  </div>
</template>

<script>
import MenuBar from '@/components/MenuBar'

export default {
  components: {
    MenuBar
  },
  data: function () {
    return { views: [
        {name: "Calendar", icon: "fa-calendar", route: 'calendar'},
        {name: "Classlist Manager", icon: "fa-users", route: "classlist"},
        {name: "Problem Set Details", icon: "fa-info-circle", route: "set-details"},
        {name: "Library Browser", icon: "fa-university", route: "library"},
        {name: "Problem Sets Manager", icon: "fa-list-alt", route: "problem-sets"},
        {name: "Problem Editor", icon: "fa-edit", route: 'editor'},
        {name: "Student Progress", icon: "fa-chart-bar", route: 'statistics'},
        {name: "Import/Export Sets", icon: "fa-exchange-alt", route: 'import-export'},
        {name: "Settings", icon: "fa-cogs", route: 'settings'}
      ],
      sidebars: [
        {name: "Problem Sets", comp: "problem_sets"},
        {name: "Library Options", comp: "lib_opts"},
        {name: "Messages", comp: "messages"}
      ],
      current_view: "set-details",
      current_sidebar: "lib_opts",
      show_sidebar: false,
      problem_sets: null,
      selected_set_id: "",
      user: {user_id: "peter", first_name: "Peter", last_name: "Staab"},
      users: null,
      settings: null,
    }
  },
  methods: {
    changeView(_route){
      this.current_view = _route;
    }
  },
  mounted(){
    this.$router.replace("/courses/test/manager/problem-sets");
      // this is all a hack to get MathJax loaded.  Eventually this need to just be imported.
    if (document.getElementById('mathjax-scr')) return; // was already loaded
    var scriptTag = document.createElement("script");
    scriptTag.src = "https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.5/MathJax.js?config=TeX-MML-AM_CHTML";
    scriptTag.id = "mathjax-scr";
    document.getElementsByTagName('head')[0].appendChild(scriptTag);
  },
  created: function() { // load all of the relevant data
    this.$store.dispatch('setLoginInfo',{course_id: "test"})
    this.$store.dispatch('fetchSettings')
    this.$store.dispatch('fetchUsers')
    this.$store.dispatch('fetchProblemSets')
  },
  watch: {
    '$route' (to, from) {
      this.current_view = to.path.split("/").pop()
    }
  }
}
</script>

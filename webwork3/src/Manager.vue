<template>
  <div>
    <menu-bar :views="views" :current_view="current_view"  :user="user"
              :sidebars="sidebars" :current_sidebar="current_sidebar"
              @change-view="current_view = $evt"
              @show-hide-sidebar="show_sidebar = !show_sidebar"/>
    <b-container><router-view/></b-container>
  </div>
</template>

<script>

// main views
import MenuBar from '@/components/MenuBar'

export default {
  name: 'app',
  props: {
    params: Object
  },
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
        {name: "Statistics", icon: "fa-chart-bar", route: 'statistics'},
        {name: "Import/Export Sets", icon: "fa-exchange-alt", route: 'import-export'},
        {name: "Settings", icon: "fa-cogs", route: 'settings'}
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
    this.$store.dispatch('setLoginInfo',this.$route.params)
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
    },
    '$route' (to) { // (to,from)
      this.current_view = to.path.split("/").pop()
    }
  },
  mounted: function () {
    this.current_view = this.$route.fullPath.split("/").pop();
  }
}
</script>

<style>
#sidebar {
  background-color: rgb(240,240,240)
}
</style>

<template>
  <div>
    <menu-bar :views="views" :current_view="current_view"
              :sidebars="sidebars" :current_sidebar="current_sidebar"
              @change-view="current_view = $evt" @logout="logout"
              @show-hide-sidebar="show_sidebar = !show_sidebar"/>
    <b-container><router-view/></b-container>
  </div>
</template>

<script>
import axios from 'axios'
import {mapState} from 'vuex'
// main views
import MenuBar from '@/components/common_components/MenuBar'

export default {
  name: 'app',
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
    }
  },
  computed:{
    ...mapState(['login_info'])
  },
  created: function() { // load all of the relevant data
    this.$store.dispatch('updateLoginInfo',this.$route.params)
    const self = this;
    axios.get('/webwork3/api/courses/' + this.login_info.course_id + '/login')
      .then(response => {
        var user = {}
        if(response.data.logged_in == 1){
          self.$store.dispatch('fetchSettings')
          self.$store.dispatch('fetchUsers')
          self.$store.dispatch('fetchProblemSets');
          ["user_id","first_name","last_name"].forEach(_key => {user[_key] = response.data[_key]})
          self.$store.dispatch('updateLoginInfo',user)
        } else {
          self.$router.replace("/courses/" + this.login_info.course_id + '/login')
        }
      }).catch( err => {
        // eslint-disable-next-line
        console.log(err);
        self.$router.replace("/courses/" + self.login_info.course_id + "/login")
      })

  },
  methods: {
    //changeView: function(comp) {this.current_view = comp},
    changeSidebar: function(comp){this.current_sidebar = comp;},
    logout: function(){
      axios.post("/webwork3/api/courses/" + this.login_info.course_id + "/logout").
      then( () => {
        this.$router.replace("/courses/" + this.login_info.course_id + "/login")
      })
    }
  },
  watch: {
    '$route' (to) { // (to,from)
      this.current_view = to.path.split("/").pop()
    }
  },
  mounted: function () {
    this.current_view = this.$route.fullPath.split("/").pop();
    // eslint-disable-next-line
    console.log(this.current_view)
  }
}
</script>

<style>
#sidebar {
  background-color: rgb(240,240,240)
}
</style>

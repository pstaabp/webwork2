<template>
  <div id="app">
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
    <b-navbar fixed="bottom"><b-nav-text>Bottom</b-nav-text></b-navbar>
  </div>
</template>

<script>


export default {
  data: function () {
    return {
      // current_view: "set-details",
      // current_sidebar: "lib_opts",
      // show_sidebar: false,
      // problem_sets: null,
      // selected_set_id: "",
      // user: {user_id: "peter", first_name: "Peter", last_name: "Staab"},
      // users: null,
      // settings: null,
    }
  },
  mounted(){
      // this is all a hack to get MathJax loaded.  Eventually this need to just be imported.
    if (document.getElementById('mathjax-scr')) return; // was already loaded
    var scriptTag = document.createElement("script");
    scriptTag.src = "https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.5/MathJax.js?config=TeX-MML-AM_CHTML";
    scriptTag.id = "mathjax-scr";
    document.getElementsByTagName('head')[0].appendChild(scriptTag);
  },
  // created: function() { // load all of the relevant data
  //   this.$store.dispatch('setLoginInfo',this.$route.params)
  //   this.$store.dispatch('fetchSettings')
  //   this.$store.dispatch('fetchUsers')
  //   this.$store.dispatch('fetchProblemSets')
  // },
}
</script>

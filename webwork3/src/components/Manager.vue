<template>
  <div>
    <menu-bar :views="views" :current_view="current_view"
              :sidebars="sidebars" :current_sidebar="current_sidebar"
              @change-view="current_view = $evt" @logout="logout"
              @show-hide-sidebar="show_sidebar = !show_sidebar"/>
    <b-container><router-view/></b-container>
  </div>
</template>

<script lang="ts">
import axios from 'axios';

import Constants from '@/common';
import MenuBar from '@/components/common_components/MenuBar.vue';
import { Vue, Component, Watch } from 'vue-property-decorator';

import login_module from '@/store/modules/login';
import settings_module from '@/store/modules/settings';
import users_module from '@/store/modules/users';
import problem_sets_module from '@/store/modules/problem_sets';

@Component({
  name: 'Manager',
  components: {
    MenuBar,
  },
})
export default class Manager extends Vue {
  private current_view: string = 'calendar';
  private current_sidebar: string = 'lib_opts';
  private show_sidebar: boolean = false;
  private views: object[] = Constants.views();
  private sidebars: object[] = Constants.sidebars();

  @Watch('$route')
  private onPropertyChanged(value: {path: string}) {
    this.current_view = value.path.split('/').pop() || '';
  }

  private async created() { // load all of the relevant data

    if (login_module.login_info && login_module.login_info.logged_in) {
      settings_module.fetchSettings();
      users_module.fetchUsers();
      problem_sets_module.fetchProblemSets();
    } else {
      this.$router.replace('/courses/' + login_module.login_info.course_id + '/login');
      }
  }

  private changeSidebar(comp: string): void {
    this.current_sidebar = comp;
  }

  private logout(): void {
    axios.post('/webwork3/api/courses/' + login_module.login_info.course_id + '/logout').
      then( () => {
        this.$router.replace('/courses/' + login_module.login_info.course_id + '/login');
      });
  }


  private mounted() {
    this.current_view = this.$route.fullPath.split('/').pop() || '';
  }
}
</script>

<style>
#sidebar {
  background-color: rgb(240,240,240)
}
</style>

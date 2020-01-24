<template>
  <div>
    <menu-bar @logout="logout" />
    <b-container><router-view/></b-container>
  </div>
</template>

<script lang="ts">
import axios from 'axios';

import Common from '@/common';
import MenuBar from '@/components/common_components/MenuBar.vue';
import { Vue, Component, Watch } from 'vue-property-decorator';

import login_module from '@/store/modules/login';
import settings_module from '@/store/modules/settings';
import users_module from '@/store/modules/users';
import problem_sets_module from '@/store/modules/problem_sets';
import app_state from '@/store/modules/app_state';

@Component({
  name: 'Manager',
  components: {
    MenuBar,
  },
})
export default class Manager extends Vue {

  @Watch('$route.path')
  private onRouteChanged(value: {path: string}) {
    app_state.setCurrentView(this.$route.path.split('/')[4]);
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


  private logout(): void {
    axios.post('/webwork3/api/courses/' + login_module.login_info.course_id + '/logout').
      then( () => {
        this.$router.replace('/courses/' + login_module.login_info.course_id + '/login');
      });
  }

  private mounted() {
    app_state.setCurrentView(this.$route.fullPath.split('/').pop() || '');
  }
}
</script>

<style>
#sidebar {
  background-color: rgb(240,240,240)
}
</style>

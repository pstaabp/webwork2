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

import Constants from '@/Constants';
import MenuBar from '@/components/common_components/MenuBar.vue';
import { Vue, Component, Watch } from 'vue-property-decorator';

import { getModule } from 'vuex-module-decorators';
import WeBWorKStore from '@/store';
const store = getModule(WeBWorKStore);

// models
import User from '@/models/User';
// import UserList from '@/models/UserList';

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

  public created(): void { // load all of the relevant data
    store.updateLoginInfo(this.$route.params);

    axios.get('/webwork3/api/courses/' + store.login_info.course_id + '/login')
      .then( (response) => {
        if (response.data.logged_in === 1) {
          store.fetchSettings();
          store.fetchUsers();
          store.fetchProblemSets();
          store.updateLoginInfo({user: new User({
              user_id: response.data.user_id,
              first_name: response.data.first_name,
              last_name: response.data.last_name,
            }),
          });
        } else {
          this.$router.replace('/courses/' + store.login_info.course_id + '/login');
        }
      }).catch( (err) => {
        // tslint:disable-next-line
        console.log(err);
        this.$router.replace('/courses/' + store.login_info.course_id + '/login');
      });
  }

  private changeSidebar(comp: string): void {
    this.current_sidebar = comp;
  }

  private logout(): void {
    axios.post('/webwork3/api/courses/' + store.login_info.course_id + '/logout').
      then( () => {
        this.$router.replace('/courses/' + store.login_info.course_id + '/login');
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

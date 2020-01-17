<template>
  <div>
    <b-navbar toggleable='lg' type='dark' id='top-navbar' class='fixed-top'>
      <b-navbar-brand href='#'><img id='wwlogo' src='/webwork3/images/webwork_square.svg'>WeBWorK</b-navbar-brand>

      <b-navbar-toggle target='nav_collapse' />

      <b-collapse is-nav id='nav_collapse'>
        <b-navbar-nav id='view-name-container'>
          <b-nav-text class="mr-2"><b-icon :icon='current_icon' variant='light' font-scale='2' /></b-nav-text>
          <b-navbar-brand id='view-name'>  {{current_view | getName(views)}}
          </b-navbar-brand>
          <b-nav-item-dropdown class='mt-1' variant='outline-primary'>
            <b-dropdown-item v-for='view in views' :key='view.route'>
              <router-link class='view-link' :to='path(view.route)'>
                 <b-icon :icon='view.icon'/>
                 <span class='pl-2'>{{view.name}}</span>
               </router-link>
            </b-dropdown-item>
          </b-nav-item-dropdown>
        </b-navbar-nav>
        <b-navbar-nav v-if="show_set" class="mr-3">
          <b-nav-text class="font-weight-bold text-light">Selected Set: {{selected_set || 'none'}}</b-nav-text>
          <b-nav-item-dropdown variant='outline-primary'>
            <b-dropdown-item v-for='set_id in set_names' :key='set_id'>
              <b-dropdown-item @click="selected_set = set_id" href="#">{{set_id}}</b-dropdown-item>
            </b-dropdown-item>
          </b-nav-item-dropdown>
        </b-navbar-nav>
        <b-navbar-nav v-if="show_user" class="mr-3">
          <b-nav-text class="font-weight-bold text-light">Selected User: {{selected_user || 'none'}}</b-nav-text>
          <b-nav-item-dropdown variant='outline-primary'>
            <b-dropdown-item v-for='user_id in users' :key='user_id'>
              <b-dropdown-item @click="selected_user = user_id" href="#">{{user_id}}</b-dropdown-item>
            </b-dropdown-item>
          </b-nav-item-dropdown>
        </b-navbar-nav>

        <b-navbar-nav class='ml-auto'>
          <message-bar />
          <b-nav-item-dropdown right>
            <template slot='button-content'>
              Sidebar
            </template>
            <b-dd-item  href='#' @click="$emit('show-hide-sidebar')">Show/Hide Sidebar</b-dd-item>
            <b-dd-divider/>
            <b-dd-item v-for='sb in sidebars' href='#' @click="$emit('change-sb',sb.comp)"
            :key='sb.comp'>{{sb.name}}</b-dd-item>
          </b-nav-item-dropdown>
          <b-nav-item-dropdown right>
            <!--Using button-content slot -->
            <template slot='button-content'>
              <i class='fas fa-user-alt'></i>
            </template>
            <b-dropdown-text>{{fullname}}</b-dropdown-text>
            <b-dropdown-item href='#' v-b-modal.settings><i class='fas fa-cog mr-2'></i>Settings</b-dropdown-item>
            <b-dropdown-item @click="$emit('logout')"><i class='fas fa-sign-out-alt mr-2'></i>Logout</b-dropdown-item>
          </b-nav-item-dropdown>

        </b-navbar-nav>
      </b-collapse>
    </b-navbar>
    <b-modal id='settings' size='lg' title='User Settings'>
      <table class='table table-sm'>
        <tbody>
          <tr><td>Name:</td><td>{{fullname}}</td></tr>
          <tr><td>login name:</td><td>{{login_info.user_id}}</td></tr>
          <tr><td>Email: </td><td>{{login_info}}</td></tr>
          <tr><td>Password:</td>
              <td><b-button variant='outline-primary' size='sm' @click='change_password = !change_password'>
                {{change_password?'Cancel Change': 'Change Password'}}</b-button></td></tr>
          <tr> <td colspan='2'><b-form-group v-if='change_password' label='Current Password' label-cols='5'>
              <b-input type='password'></b-input></b-form-group></td> </tr>
          <tr v-if='change_password'><td colspan='2'><b-form-group label='New Password:' label-cols='5'>
              <b-input type='password'></b-input></b-form-group></td>
          </tr>
          <tr v-if='change_password'><td colspan='2'><b-form-group label='Confirm Password:' label-cols='5'>
              <b-input type='password'></b-input></b-form-group></td>
          </tr>
        </tbody>
      </table>
    </b-modal>
  </div>
</template>

<script lang="ts">
import { BNavbar } from 'bootstrap-vue';

import {Vue, Component, Prop, Watch} from 'vue-property-decorator';

import Common from '@/common';
import MessageBar from './MessageBar.vue';

import login_store from '@/store/modules/login';
import problem_set_store from '@/store/modules/problem_sets';
import app_state from '@/store/modules/app_state';
import user_store from '@/store/modules/users';

import {LoginInfo} from '@/store/models';



interface RouteObj {
  name: string;
  route: string;
}


@Component({
  name: 'MenuBar',
  components: {
    MessageBar,
    BNavbar,
  },
  filters: {
    getName: (route: string, arr: RouteObj[]): string =>  {
      if (arr !== undefined) {
        const obj = arr.find( (_obj: RouteObj) => _obj.route === route );
        if (obj !== undefined) {
          return obj.name;
        }
      }

      return 'Select View';
    },
  },
})
export default class MenuBar extends Vue {
  private change_password: boolean = false;

  private views = Common.views();
  private sidebars = Common.sidebars();

  get current_view() {
    return app_state.current_view;
  }

  get current_icon() {
    const view = Common.views().find( (_v) => _v.route === this.current_view);
    return view ? view.icon : '';
  }

  get selected_set() {
    return app_state.selected_set;
  }

  set selected_set(_set_id: string) {
    app_state.setSelectedSet(_set_id);
  }

  get selected_user() {
    return app_state.selected_user;
  }

  set selected_user(_user_id: string) {
    app_state.setSelectedUser(_user_id);
  }

  get show_set() {
    const view = this.views.find( (_v) => _v.route === this.current_view);
    return view ? view.show_set : false;
  }

  get show_user() {
    const view = this.views.find( (_v) => _v.route === this.current_view);
    return view ? view.show_user : false;
  }

  get users() {
    return Array.from(user_store.users.keys());
  }

  get set_names() {
    return Array.from(problem_set_store.problem_sets.keys());
  }


  get login_info(): LoginInfo {
    return login_store.login_info;
  }

  get fullname(): string {
    return login_store.login_info.user.first_name + ' ' +
      login_store.login_info.user.last_name;
  }

  private path(route: string): string {
    return '/courses/' + login_store.login_info.course_id + '/manager/' + route;
  }

  // private created() { // watch for changes in the selected set from the menu bar.
  //   this.$store.subscribe((mutation, state) => {
  //     if (mutation.type === 'problem_set_store/setProblemSets') {
  //       this.set_names = Array.from(problem_set_store.problem_sets.keys());
  //    }
  //  });
 // }
} // class MenuBar
</script>

<style scoped>
#view-name { font-size: 140%}
.view-link {color: black}
#view-name-container {width: 300px;}
</style>

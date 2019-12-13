<template>
  <div>
    <b-navbar toggleable='lg' type='dark' id='top-navbar' class='fixed-top'>
      <b-navbar-brand href='#'><img id='wwlogo' src='/webwork3/images/webwork_square.svg'>WeBWorK</b-navbar-brand>

      <b-navbar-toggle target='nav_collapse' />

      <b-collapse is-nav id='nav_collapse'>
        <b-navbar-nav>
          <b-navbar-brand id='view-name'>  {{current_view | getName(views)}}
          </b-navbar-brand>
          <b-nav-item-dropdown class='mt-1' variant='outline-primary'>
            <b-dropdown-item v-for='view in views' :key='view.route'>
              <router-link class='view-link' :to='path(view.route)'>
                 <font-awesome-icon :icon='view.icon' size='lg'/>
                 <span class='pl-2'>{{view.name}}</span>
               </router-link>
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

import MessageBar from './MessageBar.vue';
import {Vue, Component} from 'vue-property-decorator';

import { getModule } from 'vuex-module-decorators';
import WeBWorKStore from '@/store';
const store = getModule(WeBWorKStore);

import LoginInfo from '@/models/LoginInfo';



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
  props: {
    views: Array,
    current_view: String,
    sidebars: Array,
    current_sidebar: String,
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

  get login_info(): LoginInfo {
    return store.login_info;
  }

  get fullname(): string {
    return store.login_info.logged_in_user.get('first_name') + ' ' +
      store.login_info.logged_in_user.get('last_name');
  }

  private path(route: string): string {
    return '/courses/' + store.login_info.course_id + '/manager/' + route;
  }
} // class MenuBar
</script>

<style scoped>
#view-name { font-size: 140%}
.view-link {color: black}
</style>

<script lang="ts">
import { BNavbar } from "bootstrap-vue";

import { Vue, Component } from "vue-property-decorator";

import Dropdown from "vue-simple-search-dropdown";

import Common, { ww3Views } from "@/common";
import NotificationBar from "./NotificationBar.vue";

import login_store from "@/store/modules/login";
import problem_set_store from "@/store/modules/problem_sets";
import app_state from "@/store/modules/app_state";
import user_store from "@/store/modules/users";

import { LoginInfo } from "@/store/models";

interface RouteObj {
  name: string;
  route: string;
}

@Component({
  name: "MenuBar",
  components: {
    NotificationBar,
    BNavbar,
    Dropdown,
  },
})
export default class MenuBar extends Vue {
  private change_password = false;
  private views = ww3Views();
  private sidebars = Common.sidebars();

  get current_view() {
    return app_state.current_view;
  }

  get current_icon() {
    const view = this.views.find((_v) => _v.route === this.current_view);
    return view ? view.icon : "";
  }

  get selected_user_id() {
    return app_state.selected_user;
  }

  get selected_user() {
    return user_store.users.get(this.selected_user_id);
  }

  get selected_user_full_name() {
    if (!this.selected_user) {
      return "";
    }
    return this.selected_user.first_name + " " + this.selected_user.last_name;
  }

  get show_set() {
    return app_state.show_set_options;
  }

  get show_user() {
    return app_state.show_user_options;
  }

  get users() {
    return Array.from(user_store.users.keys());
  }

  get set_names_for_dd() {
    return Array.from(problem_set_store.problem_sets.keys())
      .sort()
      .map((_set_id) => ({ name: _set_id, id: _set_id }));
  }

  get user_names_for_dd() {
    return Array.from(user_store.users.values()).map((_user) => ({
      name: _user.first_name + " " + _user.last_name,
      id: _user.user_id,
    }));
  }

  get login_info(): LoginInfo {
    return login_store.login_info;
  }

  get fullname(): string {
    return (
      login_store.login_info.user.first_name +
      " " +
      login_store.login_info.user.last_name
    );
  }

  private getName(route: string, arr: RouteObj[]) {
    if (arr !== undefined) {
      const obj = arr.find((_obj: RouteObj) => _obj.route === route);
      if (obj !== undefined) {
        return obj.name;
      }
    }

    return "Select View";
  }

  private path(route: string): string {
    if (route === "set-view" && app_state.selected_set) {
      return (
        "/courses/" +
        login_store.login_info.course_id +
        "/manager/" +
        route +
        "/" +
        app_state.selected_set
      );
    }
    return "/courses/" + login_store.login_info.course_id + "/manager/" + route;
  }

  private setSelectedSet(_set: { name: string; id: string }) {
    // for some reasone this is firing when switching view (only to ProblemSetInfo ???)

    console.log("changing set in menu bar"); // eslint-disable-line no-console
    if (_set && _set.name) {
      app_state.setSelectedSet(_set.name);
    }

    // this is a hack to get the set option to populate
    setTimeout(() => {
      const div = document.getElementById("set_options");
      const input = (div && div.firstElementChild) as HTMLInputElement;
      if (input) {
        // input.value = app_state.selected_set;
        input.setAttribute("autocomplete", "off");
      }
    }, 200);
  }

  private setSelectedUser(_user: { name: string; id: string }) {
    // for some reasone this is firing when switching view (only to ProblemSetInfo ???)
    if (_user && _user.name) {
      app_state.setSelectedUser(_user.id);
    }

    // this is a hack to get the set option to populate and turn off autocomplete
    setTimeout(() => {
      const div = document.getElementById("user_options");
      const input = (div && div.firstElementChild) as HTMLInputElement;
      if (input) {
        input.value = this.fullname;
        input.setAttribute("autocomplete", "off");
      }
    }, 200);
  }
} // class MenuBar
</script>

<template>
  <div>
    <b-navbar id="top-navbar" toggleable="lg" type="dark" class="fixed-top">
      <b-navbar-brand href="#">
        <img id="wwlogo" src="/webwork3/images/webwork_square.svg" />
        WeBWorK
      </b-navbar-brand>
      <b-navbar-toggle target="nav_collapse" />

      <b-collapse id="nav_collapse" is-nav>
        <b-navbar-nav id="view-name-container">
          <b-nav-text class="mr-2">
            <b-icon :icon="current_icon" variant="light" font-scale="2" />
          </b-nav-text>
          <b-navbar-brand id="view-name">
            {{ getName(current_view, views) }}
          </b-navbar-brand>
          <b-nav-item-dropdown class="mt-1" variant="outline-primary">
            <b-dd-item v-for="view in views" :key="view.route">
              <router-link class="view-link" :to="path(view.route)">
                <b-icon :icon="view.icon" />
                <span class="pl-2">{{ view.name }}</span>
              </router-link>
            </b-dd-item>
          </b-nav-item-dropdown>
        </b-navbar-nav>
        <b-navbar-nav v-if="show_set" class="mr-3">
          <b-nav-text class="font-weight-bold text-light mr-3">
            Selected Set:
          </b-nav-text>
          <dropdown
            id="set_options"
            :options="set_names_for_dd"
            :max-item="100"
            placeholder="Select a set"
            @selected="setSelectedSet"
          />
        </b-navbar-nav>
        <b-navbar-nav v-if="show_user" class="mr-3">
          <b-nav-text class="font-weight-bold text-light mr-3">
            Selected User:
          </b-nav-text>
          <dropdown
            id="user_options"
            :options="user_names_for_dd"
            :max-item="100"
            placeholder="Select a User"
            @selected="setSelectedUser"
          />
        </b-navbar-nav>

        <b-navbar-nav class="ml-auto">
          <notification-bar />
          <b-nav-item-dropdown right>
            <!--Using button-content slot -->
            <template #button-content>
              <b-icon icon="person" />
            </template>
            <b-dd-text>{{ fullname }}</b-dd-text>
            <b-dd-item v-b-modal.settings href="#">
              <b-icon icon="gear" /> Settings
            </b-dd-item>
            <b-dd-item @click="$emit('logout')">
              <b-icon icon="circle-slash" /> Logout
            </b-dd-item>
          </b-nav-item-dropdown>
        </b-navbar-nav>
      </b-collapse>
    </b-navbar>
    <b-modal id="settings" size="lg" title="User Settings">
      <table class="table table-sm">
        <tbody>
          <tr>
            <td>Name:</td>
            <td>{{ fullname }}</td>
          </tr>
          <tr>
            <td>login name:</td>
            <td>{{ login_info.user_id }}</td>
          </tr>
          <tr>
            <td>Email:</td>
            <td>{{ login_info }}</td>
          </tr>
          <tr>
            <td>Password:</td>
            <td>
              <b-button
                variant="outline-primary"
                size="sm"
                @click="change_password = !change_password"
              >
                {{ change_password ? "Cancel Change" : "Change Password" }}
              </b-button>
            </td>
          </tr>
          <tr>
            <td colspan="2">
              <b-form-group
                v-if="change_password"
                label="Current Password"
                label-cols="5"
              >
                <b-input type="password" />
              </b-form-group>
            </td>
          </tr>
          <tr v-if="change_password">
            <td colspan="2">
              <b-form-group label="New Password:" label-cols="5">
                <b-input type="password" />
              </b-form-group>
            </td>
          </tr>
          <tr v-if="change_password">
            <td colspan="2">
              <b-form-group label="Confirm Password:" label-cols="5">
                <b-input type="password" />
              </b-form-group>
            </td>
          </tr>
        </tbody>
      </table>
    </b-modal>
  </div>
</template>

<style scoped>
#view-name {
  font-size: 140%;
}
.view-link {
  color: black;
}
#view-name-container {
  width: 325px;
}
</style>

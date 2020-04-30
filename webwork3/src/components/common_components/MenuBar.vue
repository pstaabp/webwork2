<script lang="ts">
import { Vue, Component, Watch } from "vue-property-decorator";

// load icons:
import { BIconPerson, BIconGear, BIconXOctagon } from "bootstrap-vue";
Vue.component("BIconPerson", BIconPerson);
Vue.component("BIconGear", BIconGear);
Vue.component("BIconXOctagon", BIconXOctagon);

import ViewIcon from "./ViewIcon.vue";

import Dropdown from "vue-simple-search-dropdown";

import { getManagerViews, getStudentViews, newUser } from "@/common";
import NotificationBar from "./NotificationBar.vue";

import login_store from "@/store/modules/login";
import problem_set_store from "@/store/modules/problem_sets";
import app_state from "@/store/modules/app_state";
import user_store from "@/store/modules/users";

import { LoginInfo, User } from "@/store/models";

interface RouteObj {
  name: string;
  route: string;
}

@Component({
  name: "MenuBar",
  components: {
    ViewIcon,
    NotificationBar,
    //BNavbar,
    Dropdown,
  },
})
export default class MenuBar extends Vue {
  private change_password = false;
  private views = this.professor_view ? getManagerViews() : getStudentViews();

  private get current_view() {
    return app_state.current_view;
  }

  private get current_icon() {
    const view = this.views.find((_v) => _v.route === this.current_view);
    return view ? view.icon : "";
  }

  private get view_name(): string {
    const view = this.views.find((_v) => _v.route === this.current_view);
    return (view && view.name) || "Select View";
  }

  private get professor_view() {
    // determine if the user has appropriate permissions
    return login_store.login_info.permission > 0;
  }

  private get selected_user_id() {
    return app_state.selected_user;
  }

  private get selected_user() {
    return user_store.users.get(this.selected_user_id);
  }

  private get selected_user_full_name() {
    if (!this.selected_user) {
      return "";
    }
    return this.selected_user.first_name + " " + this.selected_user.last_name;
  }

  private get show_set() {
    return app_state.show_set_options;
  }

  private get show_user() {
    return app_state.show_user_options;
  }

  private get users() {
    return Array.from(user_store.users.keys());
  }

  private get set_names_for_dd() {
    return Array.from(problem_set_store.problem_sets.keys())
      .sort()
      .map((_set_id) => ({ name: _set_id, id: _set_id }));
  }

  private get user_names_for_dd() {
    return Array.from(user_store.users.values()).map((_user) => ({
      name: _user.first_name + " " + _user.last_name,
      id: _user.user_id,
    }));
  }

  private get login_info(): LoginInfo {
    return login_store.login_info;
  }

  private get login_user(): User {
    const user = user_store.users.get(this.login_info.user_id);
    return user || newUser();
  }

  private get fullname(): string {
    return this.login_user.first_name + " " + this.login_user.last_name;
  }

  @Watch("$route.path")
  private onRouteChanged() {
    app_state.setCurrentView(this.$route.name as string);
    const view = this.views.find((_v) => _v.name === app_state.current_view);
    console.log(view); // eslint-disable-line no-console
    if (view) {
      app_state.setShowSetOptions(view.show_set);
      app_state.setShowUserOptions(view.show_user);
    }
  }

  private path(route: string) {
    if (route === "set-view" && app_state.selected_set) {
      return {
        name: "set-view",
        params: { set_id: app_state.selected_set },
      };
    } else {
      return { name: route };
    }
  }

  private setSelectedSet(_set: { name: string; id: string }) {
    // for some reasone this is firing when switching view (only to ProblemSetInfo ???)
    if (_set && _set.name) {
      app_state.setSelectedSet(_set.name);
    }

    // this is a hack to get the set option to populate
    setTimeout(() => {
      const div = document.getElementById("set_options");
      const input = (div && div.firstElementChild) as HTMLInputElement;
      if (input) {
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
            <view-icon
              v-if="current_icon !== ''"
              :icon="current_icon"
              variant="light"
              scale="1.5"
            />
            <!-- <b-icon :icon="current_icon" variant="light" font-scale="2" /> -->
          </b-nav-text>
          <b-navbar-brand id="view-name" class="ml-2">
            {{ view_name }}
          </b-navbar-brand>
          <b-nav-item-dropdown class="mt-1" variant="outline-primary">
            <b-dd-item v-for="view in views" :key="view.route">
              <router-link class="view-link" :to="path(view.route)">
                <view-icon :icon="view.icon" />
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
              <b-icon-person />
            </template>
            <b-dd-text>{{ fullname }}</b-dd-text>
            <b-dd-item v-b-modal.settings href="#">
              <b-icon-gear /> Settings
            </b-dd-item>
            <b-dd-item @click="$emit('logout')">
              <b-icon-x-octagon /> Logout
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
            <td>{{ login_user.email_address }}</td>
          </tr>
          <tr>
            <td>Password:</td>
            <td>
              <b-btn
                variant="outline-primary"
                size="sm"
                @click="change_password = !change_password"
              >
                {{ change_password ? "Cancel Change" : "Change Password" }}
              </b-btn>
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

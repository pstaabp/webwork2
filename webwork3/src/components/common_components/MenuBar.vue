<script lang="ts">
import { Vue, Component, Watch } from "vue-property-decorator";

// load icons:
import { BIconPerson, BIconGear, BIconXOctagon } from "bootstrap-vue";
Vue.component("BIconPerson", BIconPerson);
Vue.component("BIconGear", BIconGear);
Vue.component("BIconXOctagon", BIconXOctagon);

import ViewIcon from "./ViewIcon.vue";

import { instructor_views, student_views, newUser } from "@/common";
import NotificationBar from "./NotificationBar.vue";

import { app_state_store, users_store, login_store } from "@/store";

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
  },
})
export default class MenuBar extends Vue {
  private change_password = false;
  private views = this.professor_view ? instructor_views : student_views;

  private get current_view() {
    return app_state_store.current_view;
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
    return this.login_info.permission > 0;
  }

  private get users() {
    return users_store.users;
  }

  private get login_info(): LoginInfo {
    return login_store.login_info;
  }

  private get login_user(): User {
    // TODO: for some reason the getUser is returing a promise.  Why?
    //return user_store.getUser(this.login_info.user_id) || newUser();

    return (
      users_store.users.find(
        (_user: User) => _user.user_id === this.login_info.user_id
      ) || newUser()
    );
  }

  private get fullname(): string {
    return this.login_user.first_name + " " + this.login_user.last_name;
  }

  @Watch("$route.path")
  private onRouteChanged() {
    const route_re = /^([\w-]*)-tabs$/;
    const name = this.$route.name as string;
    const m = name.match(route_re);
    app_state_store.updateAppState(
      m ? { current_view: m[1] } : { current_view: name }
    );
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
              <router-link class="view-link" :to="{ name: view.route }">
                <view-icon :icon="view.icon" />
                <span class="pl-2">{{ view.name }}</span>
              </router-link>
            </b-dd-item>
          </b-nav-item-dropdown>
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

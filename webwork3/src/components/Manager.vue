<template>
  <div>
    <menu-bar @logout="logout" />
    <b-container><router-view /></b-container>
  </div>
</template>

<script lang="ts">
import axios from "axios";

import { ww3Views } from "@/common";
import MenuBar from "@/components/common_components/MenuBar.vue";
import { Vue, Component, Watch } from "vue-property-decorator";

import login_store from "@/store/modules/login";
import settings_store from "@/store/modules/settings";
import users_store from "@/store/modules/users";
import problem_sets_store from "@/store/modules/problem_sets";
import app_state from "@/store/modules/app_state";

@Component({
  name: "Manager",
  components: {
    MenuBar,
  },
})
export default class Manager extends Vue {
  @Watch("$route.path")
  private onRouteChanged(value: { path: string }) {
    app_state.setCurrentView(this.$route.path.split("/")[4]);
    const _view = ww3Views().find((_v) => _v.route === app_state.current_view);
    if (_view) {
      app_state.setShowSetOptions(_view.show_set);
      app_state.setShowUserOptions(_view.show_user);
    }
  }

  private async created() {
    // load all of the relevant data

    if (login_store.login_info && login_store.login_info.logged_in) {
      settings_store.fetchSettings();
      users_store.fetchUsers();
      problem_sets_store.fetchProblemSets();
    } else {
      this.$router.replace(
        "/courses/" + login_store.login_info.course_id + "/login"
      );
    }
  }

  private logout(): void {
    const course_id = login_store.course_id;
    axios.post(login_store.api_header + "/logout").then(() => {
      login_store.clearLogin();
      settings_store.clearSettings();
      users_store.clearUsers();
      problem_sets_store.clearProblemSets();
      this.$router.replace("/courses/" + course_id + "/login");
    });
  }

  private mounted() {
    app_state.setCurrentView(this.$route.fullPath.split("/").pop() || "");
  }
}
</script>

<style>
#sidebar {
  background-color: rgb(240, 240, 240);
}
</style>

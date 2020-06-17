<script lang="ts">
import MenuBar from "@/components/common_components/MenuBar.vue";
import { Vue, Component } from "vue-property-decorator";

import { getModule } from "vuex-module-decorators";

import login_module from "@/store/modules/login";
const login_store = getModule(login_module);
import settings_module from "@/store/modules/settings";
const settings_store = getModule(settings_module);
import users_module from "@/store/modules/users";
const users_store = getModule(users_module);
import problem_set_module from "@/store/modules/problem_sets";
const problem_set_store = getModule(problem_set_module);
import app_state_module from "@/store/modules/app_state";
const app_state = getModule(app_state_module);

@Component({
  name: "Manager",
  components: {
    MenuBar,
  },
})
export default class Manager extends Vue {
  private async created() {
    if (
      app_state.current_path &&
      !/\/courses\/\w*\/manager/.test(app_state.current_path)
    ) {
      console.log(app_state.current_path); // eslint-disable-line no-console
      this.$router.replace(app_state.current_path);
    }
  }

  private logout(): void {
    const course_id = login_store.course_id;
    const response = login_store.logout();
    console.log(response); // eslint-disable-line no-console
    login_store.clearLogin();
    settings_store.clearSettings();
    users_store.clearUsers();
    problem_set_store.clearProblemSets();
    this.$router.replace(`/courses/${course_id}/login`);
  }

  get is_manager_path(): boolean {
    return (
      this.$route.path === "/courses/" + login_store.course_id + "/manager"
    );
  }

  private mounted() {
    app_state.updateAppState({
      current_view: this.$route.fullPath.split("/").pop() || "",
    });
  }
}
</script>

<template>
  <div>
    <menu-bar @logout="logout" />
    <b-container v-if="is_manager_path">
      <b-row>
        <b-col cols="6" offset-md="2">
          <h4>Select a View from the Pulldown menu above.</h4>
        </b-col>
      </b-row>
    </b-container>
    <b-container><router-view /></b-container>
  </div>
</template>

<script lang="ts">
import MenuBar from "@/components/common_components/MenuBar.vue";
import { Vue, Component } from "vue-property-decorator";

import login_store from "@/store/modules/login";
import settings_store from "@/store/modules/settings";
import users_store from "@/store/modules/users";
import problem_set_store from "@/store/modules/problem_sets";
import app_state from "@/store/modules/app_state";

@Component({
  name: "Manager",
  components: {
    MenuBar,
  },
})
export default class Manager extends Vue {
  private async created() {
    // load all of the relevant data

    if (login_store.login_info && login_store.login_info.logged_in) {
      settings_store.fetchSettings();
      users_store.fetchUsers();
      problem_set_store.fetchProblemSets();
    } else {
      this.$router.replace("/courses");
    }

    // this is all a hack to get MathJax loaded.  Eventually this need to just be imported.
    if (document.getElementById("mathjax-scr")) {
      return; // was already loaded
    }
    // const scriptTag = document.createElement("script");
    // scriptTag.src = "https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-chtml.js";
    // scriptTag.async = true;
    // scriptTag.id = "mathjax-scr";
    // document.getElementsByTagName("head")[0].appendChild(scriptTag);
    if (this.$route.fullPath === "/") {
      this.$router.replace("/courses");
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

  get main_manager_path() {
    return (
      this.$route.path === "/courses/" + login_store.course_id + "/manager"
    );
  }

  private mounted() {
    app_state.setCurrentView(this.$route.fullPath.split("/").pop() || "");
  }
}
</script>

<template>
  <div>
    <menu-bar @logout="logout" />
    <b-container v-if="main_manager_path">
      <b-row>
        <b-col cols="6" offset-md="2">
          <h4>Select a View from the Pulldown menu above.</h4>
        </b-col>
      </b-row>
    </b-container>
    <b-container><router-view /></b-container>
  </div>
</template>

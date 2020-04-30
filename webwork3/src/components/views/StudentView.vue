<!-- StudentView.vue

This is the main student view  -->

<script lang="ts">
import { Vue, Component } from "vue-property-decorator";

import login_store from "@/store/modules/login";
import users_store from "@/store/modules/users";
import problem_set_store from "@/store/modules/problem_sets";

import MenuBar from "@/components/common_components/MenuBar.vue";

@Component({
  name: "StudentView",
  components: {
    MenuBar,
  },
})
export default class StudentView extends Vue {
  private get main_student_path() {
    return (
      this.$route.path === "/courses/" + login_store.course_id + "/student"
    );
  }

  private async created() {
    // load all of the relevant data

    if (login_store.login_info && login_store.login_info.logged_in) {
      users_store.fetchUser(login_store.login_info.user_id);
      problem_set_store.fetchUserSets(login_store.login_info.user_id);
    }
  }

  private logout(): void {
    const course_id = login_store.course_id;
    const response = login_store.logout();
    console.log(response); // eslint-disable-line no-console
    this.$router.replace(`/courses/${course_id}/login`);
  }
}
</script>

<template>
  <div>
    <menu-bar @logout="logout" />
    <b-container v-if="main_student_path">
      <b-row>
        <b-col cols="6" offset-md="2">
          <h4>Select a View from the Pulldown menu above.</h4>
        </b-col>
      </b-row>
    </b-container>
    <b-container><router-view /></b-container>
  </div>
</template>

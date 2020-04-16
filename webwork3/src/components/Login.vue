<script lang="ts">
import { UserPassword } from "@/store/models";

import { Vue, Component } from "vue-property-decorator";
import login_store from "@/store/modules/login";

@Component({
  name: "Login",
})
export default class Manager extends Vue {
  private password_info: UserPassword = {
    course_id: "",
    user_id: "",
    password: "",
  };
  private password_state = false;

  public created() {
    this.password_info.course_id = this.$route.params.course_id;
  }

  private async checkPassword() {
    const login_info = await login_store.checkPassword(this.password_info);

    console.log(login_info); // eslint-disable-line no-console
    if (login_info && login_info.logged_in) {
      if (login_info && login_info.permission >= 10) {
        this.$router.replace(
          "/courses/" + login_store.login_info.course_id + "/manager"
        );
      }
    }
  }

  private mounted() {
    // give the login username focus on page load.
    ((this.$refs["login-input"] as Vue).$el as HTMLInputElement).focus();
  }

  private cancel() {
    this.$router.push("/courses");
  }
}
</script>

<template>
  <div>
    <b-navbar id="top-navbar" toggleable="lg" type="dark" class="fixed-top">
      <b-navbar-brand href="#">
        <img id="wwlogo" src="/webwork3/images/webwork_square.svg" />
      </b-navbar-brand>
      <b-navbar-brand>WeBWorK</b-navbar-brand>
      <b-navbar-brand>Login to {{ password_info.course_id }}</b-navbar-brand>
    </b-navbar>
    <b-container>
      <b-row>
        <b-col offset-md="3" cols="6" class="border p-3 rounded">
          <p>
            Please enter your login and password for course:
            {{ password_info.course_id }}
          </p>
          <form @submit.prevent="checkPassword">
            <b-form-group
              id="login-form"
              label-cols-sm="4"
              label-cols-lg="3"
              label="Login Name"
              label-for="login"
            >
              <b-input
                id="login"
                ref="login-input"
                v-model="password_info.user_id"
              />
            </b-form-group>
            <b-form-group
              id="password-form"
              invalid-feedback="Incorrect Password"
              :state="password_state"
              label-cols-sm="4"
              label-cols-lg="3"
              label="Password"
              label-for="password"
            >
              <b-input
                id="password"
                v-model="password_info.password"
                type="password"
              />
            </b-form-group>
            <b-btn-group>
              <b-btn type="submit" variant="primary">Login</b-btn>
              <b-btn variant="outline-dark" @click="cancel">
                Cancel and Return to Course List
              </b-btn>
            </b-btn-group>
          </form>
        </b-col>
      </b-row>
    </b-container>
  </div>
</template>

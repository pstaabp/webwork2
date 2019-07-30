<template>
  <div>
    <b-navbar toggleable="lg" type="dark" id="top-navbar" class="fixed-top" >
      <b-navbar-brand href="#"><img id="wwlogo" src="/webwork3/images/webwork_square.svg"></b-navbar-brand>
      <b-navbar-brand>WeBWorK</b-navbar-brand>
      <b-navbar-brand>Login to {{course_id}}</b-navbar-brand>
    </b-navbar>
    <b-container>
      <b-row>
        <b-col offset-md="3" cols="6" class="border p-3 rounded">
          <p>Please enter your login and password for course: {{course_id}}</p>
          <form @submit.prevent="checkPassword">
            <b-form-group id="login-form"
            label-cols-sm="4" label-cols-lg="3"
            label="Login Name" label-for="login">
              <b-form-input id="login" v-model="user_id"></b-form-input>
            </b-form-group>
            <b-form-group id="password-form" invalid-feedback="Incorrect Password" :state="password_state"
            label-cols-sm="4" label-cols-lg="3"
            label="Password" label-for="password">
            <b-form-input type="password" id="password" v-model="password"></b-form-input>
          </b-form-group>
          <b-btn-group>
            <b-btn type="submit" variant="primary">Login</b-btn>
            <b-btn variant="outline-dark" @click="cancel">Cancel and Return to Course List</b-btn>
          </b-btn-group>
        </form>
      </b-col>
    </b-row>
  </b-container>
</div>
</template>

<script lang="ts">
import axios from 'axios';
import User from '@/models/User';
import LoginInfo from '@/models/LoginInfo';

import { Vue, Component, Watch } from 'vue-property-decorator';

@Component({
  name: 'Login',
})
export default class Manager extends Vue {
  private course_id: string = '';
  private user_id: string = '';
  private password: string = '';
  private password_state: boolean = false;

  public created() {
    this.course_id = this.$route.params.course_id;
  }

  private checkPassword(evt: Event) {

    axios.post('/webwork3/api/courses/' + this.course_id + '/login', {
        course_id: this.course_id,
        user_id: this.user_id,
        password: this.password,
      }).
      then((response) => {
        if (response.data.logged_in !== 1) {
          this.password_state = false;
        } else {
          const info: {[key: string]: string} = {};
          ['user_id', 'first_name', 'last_name'].forEach( (_key) => {
            info[_key] = response.data[_key];
          });
          const login_info = new LoginInfo(this.course_id, new User(info));
          this.$store.dispatch('updateLoginInfo', login_info);
          if (response.data.permission >= 10) {
            this.$router.replace('/courses/' + this.course_id + '/manager');
          }
        }
      }).catch( (err) => {
        // tslint:disable-next-line
        console.log(err);
      });
  }

  private cancel() {
    this.$router.push('/courses');
  }

}
</script>

<template>
  <div>
    <b-navbar toggleable="lg" type="dark" id="top-navbar" class="fixed-top" >
      <b-navbar-brand href="#"><img id="wwlogo" src="/webwork3/images/webwork_square.svg"></b-navbar-brand>
      <b-navbar-brand>WeBWorK</b-navbar-brand>
      <b-navbar-brand>Login to {{login_info.course_id}}</b-navbar-brand>
    </b-navbar>
    <b-container>
      <b-row>
        <b-col offset-md="3" cols="6" class="border p-3 rounded">
          <p>Please enter your login and password for course: {{login_info.course_id}}</p>
          <form @submit="checkPassword">
            <b-form-group id="login-form"
            label-cols-sm="4" label-cols-lg="3"
            label="Login Name" label-for="login">
              <b-form-input id="login" v-model="login_info.user_id"></b-form-input>
            </b-form-group>
            <b-form-group id="password-form" invalid-feedback="Incorrect Password" :state="password_state"
            label-cols-sm="4" label-cols-lg="3"
            label="Password" label-for="password">
            <b-form-input type="password" id="password" v-model="login_info.password"></b-form-input>
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

<script>
import axios from 'axios'

export default {
  data: function(){
    return {
      login_info: {
        course_id: "",
        user_id: "",
        password: ""
      },
      password_state: null,
    }
  },
  created(){
    this.login_info.course_id = this.$route.params.course_id
  },
  methods: {
    checkPassword(evt){
      evt.preventDefault()
      const self = this;
      axios.post("/webwork3/api/courses/" + this.login_info.course_id + "/login",this.login_info).
        then((response)=>{
          if (response.data.logged_in != 1){
            self.password_state = false;
          } else {
            //localStorage.setItem('ww3-user_id', response.data.user_id);
            ["user_id","first_name","last_name"].forEach(_key => {
              self.login_info[_key] = response.data[_key]
            });
            self.$store.dispatch("updateLoginInfo",self.login_info);
            if(response.data.permission >=10){
              self.$router.replace("/courses/"+ self.login_info.course_id +"/manager")
            }
          }
        }).catch(err => {
          // eslint-disable-next-line
          console.log(err);
        })
    },
    cancel(){
      this.$router.push("/courses")
    }
  }
}
</script>

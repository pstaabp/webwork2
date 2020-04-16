<template>
  <div>
    <b-navbar toggleable="lg" type="dark" id="top-navbar" class="fixed-top">
      <b-navbar-brand href="#">
        <img id="wwlogo" src="/webwork3/images/webwork_square.svg" />
      </b-navbar-brand>
      <b-navbar-brand>WeBWorK</b-navbar-brand>
      <b-navbar-brand>List of Courses </b-navbar-brand>
    </b-navbar>
    <b-container>
      <b-row>
        <b-col cols="3">
          <b-list-group>
            <b-list-group-item v-for="course in courses" :key="course">
              <router-link :to="'/courses/' + course + '/login'">
                {{ course }}
              </router-link>
            </b-list-group-item>
          </b-list-group>
        </b-col>
      </b-row>
    </b-container>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      courses: [],
    };
  },
  mounted() {
    axios.get("/webwork3/api/courses").then((response) => {
      this.courses = response.data;
    });
  },
};
</script>

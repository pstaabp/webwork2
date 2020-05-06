<!-- This is the CourseList view. It is the main page for the webwork3 interface to begin
      logging in-->

<script lang="ts">
import { Vue, Component } from "vue-property-decorator";

import { fetchSiteInfo } from "@/store/api";

@Component({ name: "CourseList" })
export default class CourseList extends Vue {
  private courses: string[] = [];
  private site_info = "Course Info";

  private async mounted() {
    const info = await fetchSiteInfo();
    this.courses = info.courses;
    this.site_info = info.site_info;
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
        <b-col offset-md="3" cols="3">
          <h2>Site Information</h2>
          <!-- eslint-disable-next-line vue/no-v-html -->
          <div v-html="site_info"></div>
        </b-col>
      </b-row>
    </b-container>
  </div>
</template>

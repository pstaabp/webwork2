<script lang="ts">
import { Vue, Component } from "vue-property-decorator";

@Component({
  name: "WeBWorK",
})
export default class WeBWorKApp extends Vue {
  private mounted() {
    if (this.$route.fullPath === "/") {
      this.$router.replace("/courses");
    }
  }
}
</script>

<template>
  <div id="app">
    <router-view />
    <b-navbar id="footer" fixed="bottom">
      <b-navbar-nav :small="true">
        <b-nav-item href="http://webwork.maa.org">WeBWorK</b-nav-item>
        <b-nav-text>©1996-2020</b-nav-text>
      </b-navbar-nav>
    </b-navbar>
  </div>
</template>

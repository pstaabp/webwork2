<script lang="ts">
import { Vue, Component } from "vue-property-decorator";

@Component({
  name: "WeBWorK",
})
export default class WeBWorKApp extends Vue {
  private mounted() {
    // this is all a hack to get MathJax loaded.  Eventually this need to just be imported.
    if (document.getElementById("mathjax-scr")) {
      return; // was already loaded
    }
    const scriptTag = document.createElement("script");
    scriptTag.src =
      "https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.5/MathJax.js?config=TeX-MML-AM_CHTML";
    scriptTag.id = "mathjax-scr";
    document.getElementsByTagName("head")[0].appendChild(scriptTag);
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
        <b-nav-text>©1996-2019</b-nav-text>
      </b-navbar-nav>
    </b-navbar>
  </div>
</template>

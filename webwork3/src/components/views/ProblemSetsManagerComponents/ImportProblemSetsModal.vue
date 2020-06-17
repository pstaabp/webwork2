<!-- ImportProblemSetsModal.vue

This is modal from the ProblemSetManager to edit a given problem set. -->

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

// import { ProblemSet } from "@/store/models";

// import { getModule } from "vuex-module-decorators";

// import problem_set_module from "@/store/modules/problem_sets";
// const problem_set_store = getModule(problem_set_module);

@Component({
  name: "ImportProblemSetsModal",
})
export default class ImportProblemSetsModal extends Vue {
  //
  //   this.$bvModal.hide("edit-problem-sets-modal");
  //   this.$emit("update-set");
  // }

  private save() {
    console.log("in save"); // eslint-disable-line no-console
  }
}
</script>

<template>
  <b-modal
    id="import-problem-sets-modal"
    ref="sfmodal"
    size="xl"
    title="Import Problem Sets"
    ok-title="Save and Close"
    @ok="save"
  >
    <b-container fluid>
      Hi!!
    </b-container>
  </b-modal>
</template>

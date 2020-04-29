<script lang="ts">
import { Vue, Component, Prop } from "vue-property-decorator";

import { BIconCheckCircle, BIconExclamationCircle } from "bootstrap-vue";
Vue.component("BIconCheckCircle", BIconCheckCircle);
Vue.component("BIconExclamationCircle", BIconExclamationCircle);

@Component({
  name: "AnswerDecoration", // name of the view
})
export default class AnswerDecoration extends Vue {
  @Prop() private type!: string;
}
</script>

<template>
  <span>
    <b-icon-check-circle
      v-if="type == 'correct'"
      class="text-success"
      font-scale="1.5"
    />
    <b-icon-exclamation-circle
      v-if="type === 'incorrect'"
      class="text-danger"
      font-scale="1.5"
    />
  </span>
</template>

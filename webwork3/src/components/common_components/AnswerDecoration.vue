<script lang="ts">
import { Vue, Component, Prop } from "vue-property-decorator";

import {
  BIconCheckCircle,
  BIconExclamationCircle,
  BIconCamera,
} from "bootstrap-vue";
Vue.component("BIconCheckCircle", BIconCheckCircle);
Vue.component("BIconExclamationCircle", BIconExclamationCircle);
Vue.component("BIconCamera", BIconCamera);

import { AnswerType } from "@/store/models";

@Component({
  name: "AnswerDecoration", // name of the view
})
export default class AnswerDecoration extends Vue {
  @Prop() private type!: string;
  @Prop() private label!: string;
  @Prop() private answer!: AnswerType;
  @Prop() private preview_latex_string!: string;

  public setPreviewString(_preview: string) {
    this.preview_latex_string = _preview;
    console.log(this.preview_latex_string); // eslint-disable-line no-console
  }
}
</script>

<template>
  <span>
    <b-btn
      v-if="label"
      :id="'preview-' + label"
      size="sm"
      variant="outline-dark"
    >
      <b-icon-camera font-scale="1" />
    </b-btn>
    <b-popover :target="'preview-' + label" placement="top" triggers="click">
      <template #title
        ><b-btn
          size="sm"
          variant="outline-dark"
          @click="$emit('preview', label)"
          >Preview</b-btn
        ></template
      >
      <span v-if="preview_latex_string"> \({{ preview_latex_string }}\) </span>
    </b-popover>

    <b-icon-check-circle
      v-if="type == 'correct'"
      class="text-success"
      font-scale="1.5"
    />
    <b-icon-exclamation-circle
      v-if="label && type === 'incorrect'"
      :id="'msg-' + label"
      class="text-danger"
      font-scale="1.5"
    />
    <b-popover
      v-if="answer && answer.ans_message"
      :target="'msg' + answer.ans_label"
      triggers="hover focus"
      placement="top"
    >
      <template #title>
        Message
      </template>
      {{ answer.ans_message }}
    </b-popover>
  </span>
</template>

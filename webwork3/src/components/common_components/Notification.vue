<script lang="ts">
import { Vue, Component, Prop } from "vue-property-decorator";

import {
  BIconChevronDown,
  BIconChevronRight,
  BIconXCircleFill,
} from "bootstrap-vue";
Vue.component("BIconChevronDown", BIconChevronDown);
Vue.component("BIconChevronRight", BIconChevronRight);
Vue.component("BIconXCircleFill", BIconXCircleFill);

import { Message } from "@/store/models";

@Component({
  name: "Notification",
})
export default class Notification extends Vue {
  @Prop()
  private message!: Message;

  private open = false;

  private removeMessage() {
    console.log("hi"); // eslint-disable-line no-console
  }
}
</script>

<template>
  <b-dd-text>
    <span style="font-size: 1.5rem;" @click="open = !open">
      <b-icon-chevron-down v-if="open" class="border rounded" />
      <b-icon-chevron-right v-else class="border rounded" />
    </span>
    <span class="px-3">{{ message.short }}</span>
    <span
      class="float-right"
      style="font-size: 1.5rem;"
      @click="$emit('remove-message', message.id)"
    >
      <b-icon-x-circle-fill variant="danger" />
    </span>
    <div v-if="open" class="long border rounded p-2">
      {{ message.long }}
    </div>
  </b-dd-text>
</template>

<style scoped>
.long {
  background: lightyellow;
}
</style>

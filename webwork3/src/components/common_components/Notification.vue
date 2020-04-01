<template>
  <b-dropdown-text>
    <span style="font-size: 1.5rem;" @click="show_long = !show_long">
      <b-icon
        :icon="show_long ? 'chevron-down' : 'chevron-right'"
        class="border rounded"
      />
    </span>
    <span class="px-3">{{ message.short }}</span>
    <span
      class="float-right"
      style="font-size: 1.5rem;"
      @click="$emit('remove-message', message.id)"
    >
      <b-icon icon="x-circle-fill" class="border rounded" variant="danger" />
    </span>
    <div class="long border rounded p-2" v-if="show_long">
      {{ message.long }}
    </div>
  </b-dropdown-text>
</template>

<script lang="ts">
import { Vue, Component, Prop } from "vue-property-decorator";

import { Message } from "@/store/models";

@Component({
  name: "Notification",
})
export default class Notification extends Vue {
  @Prop()
  private message!: Message;

  private show_long = false;

  private removeMessage() {
    console.log("hi"); // eslint-disable-line no-console
  }
}
</script>

<style scoped>
.long {
  background: lightyellow;
}
</style>

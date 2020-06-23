<script lang="ts">
import { messages_store } from "@/store";
import { Vue, Component } from "vue-property-decorator";

import Notification from "./Notification.vue";
import { Message } from "@/store/models";

@Component({
  name: "NotificationBar",
  components: {
    Notification,
  },
})
export default class NotificationBar extends Vue {
  private new_message = false;
  get messages(): Message[] {
    return messages_store.messages;
  }

  private clearMessages(): void {
    messages_store.clearMessages();
  }

  private remove(id: number): void {
    messages_store.removeMessageById(id);
  }

  private mounted() {
    // watch for changes in messages
    this.$store.subscribe((mutation) => {
      // console.log(mutation.type); // eslint-disable-line no-console
      if (mutation.type === "messages_store/ADD_MESSAGE") {
        this.new_message = true;
        setTimeout(() => {
          this.new_message = false;
        }, 4000);
      }
    });
  }
}
</script>

<template>
  <b-nav-item-dropdown right>
    <!-- Using 'button-content' slot -->
    <template #button-content>
      <span class="mr-2" :class="{ blinking: new_message }">Messages</span>
      <b-badge variant="light">
        {{ messages.length }}
        <span class="sr-only">unread messages</span>
      </b-badge>
    </template>
    <b-dd-text class="message px-1">
      <b-btn size="sm" variant="primary" @click="clearMessages">
        Clear Messages
      </b-btn>
    </b-dd-text>
    <b-dd-divider />
    <b-dd-text v-for="(message, i) in messages" :key="i" class="message px-1">
      <notification :message="message" @remove-message="remove" />
    </b-dd-text>
  </b-nav-item-dropdown>
</template>

<style scoped>
.message {
  width: 600px;
}
.blinking {
  animation: blinkingText 2s 2;
}
@keyframes blinkingText {
  0% {
    color: white;
  }
  25% {
    color: green;
  }
  50% {
    color: white;
  }
  75% {
    color: green;
  }
  100% {
    color: white;
  }
}
</style>

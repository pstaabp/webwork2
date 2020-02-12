<template>
  <b-dropdown-text>
    <b-btn variant="outline-dark" size="sm" class="xs-btn" @click="showMessage"><b-icon icon="chevron-down" /></b-btn>
    <span class="px-3">{{ message.short }}</span>
    <b-btn variant="outline-dark" size="sm" class="xs-btn" @click="removeMessage"><b-icon icon="x-circle-fill" class="danger" /></b-btn>
  </b-dropdown-text>
</template>

<script lang="ts">
import { Vue, Component, Prop } from "vue-property-decorator";

@Component({
  name: "Notification"
})
export default class Notification extends Vue {
  @Prop()
  private message!: Message;

  private removeMessage() {

  }

  private showMessage() {

  }

}
</script>

<style scoped>
.xs-btn {
  padding: 2px 4px;
}
</style>

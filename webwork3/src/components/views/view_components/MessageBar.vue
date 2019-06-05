<template>
  <b-nav-item-dropdown right>
  <!-- Using 'button-content' slot -->
    <template slot="button-content">Messages
      <b-badge variant="light">{{messages.length}}<span class="sr-only">unread messages</span></b-badge>
    </template>
    <b-dropdown-text class="message">
      <b-btn size="sm" variant="primary" @click="messages=[]">Clear Messages</b-btn>
    </b-dropdown-text>
    <b-dropdown-divider  class="message" />
    <b-dropdown-text  class="message" v-for="(message,i) in messages" :key="i">{{message}}</b-dropdown-text>
  </b-nav-item-dropdown>
</template>

<script>
import MessagesMixin from '@/mixins/messages_mixin'

export default {
  name: "MessageBar",
  mixins: [ MessagesMixin ],
  data: function(){
     return {
       messages: ["msg 1","msg 2"]
     }
   }
}
</script>

<style scoped>
  .message {width: 350px}
</style>

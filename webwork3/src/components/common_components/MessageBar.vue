<template>
  <b-nav-item-dropdown right>
  <!-- Using 'button-content' slot -->
    <template slot='button-content'>Messages
      <b-badge variant='light'>{{messages.length}}<span class='sr-only'>unread messages</span></b-badge>
    </template>
    <b-dropdown-text class='message'>
      <b-btn size='sm' variant='primary' @click='clearMessages'>Clear Messages</b-btn>
    </b-dropdown-text>
    <b-dropdown-divider  class='message' />
    <b-dropdown-text  class='message' v-for='(message,i) in messages' :key='i'>{{message}}</b-dropdown-text>
  </b-nav-item-dropdown>
</template>

<script lang="ts">
import MessagesMixin from '@/mixins/messages_mixin';
import {mapState} from 'vuex';

import {Vue, Component} from 'vue-property-decorator';

import { getModule } from 'vuex-module-decorators';
import WeBWorKStore from '@/store';
const store = getModule(WeBWorKStore);


@Component({
  name: 'MessageBar',
  mixins: [ MessagesMixin],
})
export default class MessageBar extends Vue {
  get messages() {
    return store.messages.map( (_m) => _m);
  }
  private clearMessages(): void {
    store.clearMessages();
  }
}
</script>

<style scoped>
  .message {width: 350px}
</style>

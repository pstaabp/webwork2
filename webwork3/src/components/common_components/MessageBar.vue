<template>
  <b-nav-item-dropdown right>
  <!-- Using 'button-content' slot -->
    <template slot='button-content'><span class="mr-2" :class="{blinking: new_message}">Messages</span>
      <b-badge variant='light'>{{messages.length}}<span class='sr-only'>unread messages</span></b-badge>
    </template>
    <b-dropdown-text class='message'>
      <b-btn size='sm' variant='primary' @click='clearMessages'>Clear Messages</b-btn>
    </b-dropdown-text>
    <b-dropdown-divider  class='message' />
    <b-dropdown-text  class='message' v-for='(message,i) in messages' :key='i'>{{message.get('message')}}</b-dropdown-text>
  </b-nav-item-dropdown>
</template>

<script lang="ts">
import MessagesMixin from '@/mixins/messages_mixin';

import {Vue, Component, Watch} from 'vue-property-decorator';

// set up the store
import { getModule } from 'vuex-module-decorators';
import WeBWorKStore from '@/store';
const store = getModule(WeBWorKStore);


@Component({
  name: 'MessageBar',
  mixins: [ MessagesMixin],
})
export default class MessageBar extends Vue {
  private new_message: boolean = false;
  get messages() {
    return store.messages.map( (_m) => _m);
  }

  get num_messages() {
    return store.messages.size();
  }

  private clearMessages(): void {
    store.clearMessages();
  }

  @Watch('num_messages')
  private newMessage() {
    this.new_message = true;
    setTimeout(() => {this.new_message = false; }, 4000);
  }
}
</script>

<style scoped>
  .message {width: 350px}
  .blinking{
	animation:blinkingText 2s 2;
}
@keyframes blinkingText{
	0%{		color: white;	}
	25%{	color: green;	}
	50%{	color: white;	}
	75%{	color: green;	}
	100%{	color: white;	}
}
</style>

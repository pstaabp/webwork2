import {VuexModule, Module, Action, Mutation, getModule} from 'vuex-module-decorators';
import {Message} from '@/store/models';
import store from '@/store';

import {LoginModule} from './login';
const loginModule = getModule(LoginModule);


const name = 'messages_module';

// this is to prevent an error occur with a hot reloading.

if (store.state[name]) {
  store.unregisterModule(name);
}

@Module({
  namespaced: true,
  name: 'messages_module',
  store,
  dynamic: true,
})
export class MessagesModule extends VuexModule {
  private _messages: Message[] = [];

  public get messages() {
    return this._messages;
  }
  // Messages
  @Action
  public addMessage(_msg: Message) {
    this._messages.push(_msg);
  }
  @Mutation
  public clearMessages() {
    this._messages = [];
  }
}

export default getModule(MessagesModule, store);

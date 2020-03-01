import {
  VuexModule,
  Module,
  Action,
  Mutation,
  getModule
} from "vuex-module-decorators";
import { Message } from "@/store/models";
import store from "@/store";

// this is to prevent an error occur with a hot reloading.
const name = "messages_store";
if (store.state[name]) {
  store.unregisterModule(name);
}

@Module({
  namespaced: true,
  name: "messages_store",
  store,
  dynamic: true
})
export class MessagesModule extends VuexModule {
  private _messages: Message[] = [];

  public get messages() {
    return this._messages;
  }
  // Messages
  @Action
  public addMessage(_msg: Message) {
    _msg.id = this._messages.length;
    this.ADD_MESSAGE(_msg);
  }
  @Action
  public removeMessageById(_id: number) {
    let index = this._messages.findIndex(_msg => _msg.id === _id);
    if (index > -1) {
      this.REMOVE_MESSAGE_BY_INDEX(index);
    }
  }

  @Mutation
  public clearMessages() {
    this._messages = [];
  }
  @Mutation
  private ADD_MESSAGE(_msg: Message) {
    this._messages.push(_msg);
  }

  @Mutation
  private REMOVE_MESSAGE_BY_INDEX(_index: number) {
    this._messages.splice(_index, 1);
  }
}

export default getModule(MessagesModule, store);

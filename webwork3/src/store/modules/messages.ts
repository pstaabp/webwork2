import {
  VuexModule,
  Module,
  Action,
  Mutation,
  getModule,
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
  dynamic: true,
})
export class MessagesModule extends VuexModule {
  private messages_array: Message[] = [];

  public get messages() {
    return this.messages_array;
  }
  // Messages
  @Action
  public addMessage(_msg: Message) {
    _msg.id = this.messages_array.length;
    this.ADD_MESSAGE(_msg);
  }
  @Action
  public removeMessageById(_id: number) {
    const index = this.messages_array.findIndex((_msg) => _msg.id === _id);
    if (index > -1) {
      this.REMOVE_MESSAGE_BY_INDEX(index);
    }
  }

  @Mutation
  public clearMessages() {
    this.messages_array = [];
  }
  @Mutation
  private ADD_MESSAGE(_msg: Message) {
    this.messages_array.push(_msg);
  }

  @Mutation
  private REMOVE_MESSAGE_BY_INDEX(_index: number) {
    this.messages_array.splice(_index, 1);
  }
}

export default getModule(MessagesModule, store);

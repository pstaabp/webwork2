import { VuexModule, Module, Action, Mutation } from "vuex-module-decorators";
import { Message } from "@/store/models";
import store from "@/store";

// this is to prevent an error occur with a hot reloading.
// if (store.state.messages) {
//   store.unregisterModule("messages_store");
// }

@Module({
  namespaced: true,
  name: "messages_module",
  store,
  dynamic: true,
})
export default class MessagesModule extends VuexModule {
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

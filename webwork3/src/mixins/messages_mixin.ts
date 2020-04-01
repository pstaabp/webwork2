import Vue from "vue";
import { Store } from "vuex";
import Component from "vue-class-component";

@Component
export default class MessagesMixin extends Vue {
  public addMessage(_msg: string) {
    // (this.$store as Store).display('addMessage', _msg);
  }

  public msgUpdateProblemSet(_oldParams: object, _newParams: object) {
    const msg = {
      _messageShort: "The set ", // + _oldParams.set_id + ' was updated.',
    };

    // const _keys: string[] = [];
    // Object.keys(this.problem_set).forEach( (_key) => {
    //   if (this.problem_set[_key] !== this.set_params[_key]) {
    //     _keys.push(_key);
    //   }
    // });
    // msg._message_long = '';
    // _keys.forEach((_key) => {
    //   msg._messageLong += _key + ' changed from ' + _oldParams[_key] + ' to ' + _new_params[_key] + ' ';
    // });
    // return msg;
  }
}

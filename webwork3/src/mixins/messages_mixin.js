

export default {
  methods:{
    addMessage(_msg){
      this.$store.display("addMessage",_msg);
    },
    msgUpdateProblemSet(_old_params, _new_params){
      var msg = {};
      msg._message_short = "The set " + _old_params.set_id + " was updated.";

      var _keys = [];
      Object.keys(this.problem_set).forEach(key => {
        // eslint-disable-next-line
        //console.log("key: %s; old: %s; new: %s",key,this.problem_set[key],this.set_params[key]);
        if (this.problem_set[key] !== this.set_params[key]) _keys.push(key)
      });
      msg._message_long = ""
      _keys.forEach(_key => {
        msg._message_long += _key + " changed from "+ _old_params[_key] + " to " + _new_params[_key] + " "
      })
      return msg;
    }
  }
}

export default {
  data: function(){
    return {
      messages: ["msg 1","msg 2"]
    }
  },
  methods:{
    addMessage(_msg){
      this.messages.push(_msg);
    }
  }
}

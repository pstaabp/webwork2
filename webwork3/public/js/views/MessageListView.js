/*
*  This is a Message View for delivering messages to the user
*
*/

define(['backbone','jquery','underscore','models/MessageList','models/Message'], function(Backbone,$, _,MessageList,Message){
  var MessageListView = Backbone.View.extend({
    id: "message-pane",
    isOpen: false,
    message_pane: null,
    message_number: 0, // this stores the current message number shown on the nav bar.
    template: $("#message-pane-template").html(),
    message_queue: new MessageList(),
    initialize: function () {
      _(this).bindAll("addMessage","checkQueue");
      this.messages = new MessageList();  // for storing all messages
      this.message_queue.on("add",this.checkQueue);
    },
    render: function() {
      var self = this;
      this.$el.html(this.template);
      var $j = $.noConflict();
      this.message_pane = $j("#short-message");
      return this;
    },
    /* the following two functions run the message queue to
     * display the alert on the navigation bar.
     *
     * The first message opens the message popup and then successive messages
     * 1. add to the this.messageQueue array
     * 2. start a timeout that takes the first item off the messageQueue
          displays it and waits 2000 ms.
       3. Repeat

     */
    checkQueue: function () {
      var self = this;

      var msg = this.message_queue.pop();
      if(!this.isOpen){
        this.isOpen = true;
        this.message_pane.fadeIn({duration: 500}).css("display","block");
      }

      this.message_pane
        .removeClass("alert-success alert-danger border-success border-danger")
        .addClass("alert-" + msg.get("type")).addClass("border-" + msg.get("type"))
        .text(msg.get("short"))
        .delay(5000)
        .queue(function() {
          if(self.message_queue.size()>0){
            self.checkQueue();
          } else {
              $(this).fadeOut({duration: 500, complete: function() {self.isOpen = false}});
          }
          $(this).dequeue();
        });

    },
    addMessage: function(msg){
      this.messages.add(new Message(msg));
      this.message_queue.push(new Message(msg));
    }
  });

  return MessageListView;
});

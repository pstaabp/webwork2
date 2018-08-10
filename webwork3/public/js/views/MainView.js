define(['jquery','backbone'],function($,Backbone){
  var MainView = Backbone.View.extend({
    initialize: function(options){
      var self = this;
      _(this).bindAll("setState");
      _(this).extend(_(options).pick("session","settings","users","problemSets","eventDispatcher","info"));
      this.state = new Backbone.Model({});
      this.state.on("change",function(_state){
        self.eventDispatcher.trigger("save-state");
      });
      this.state.set(this.getDefaultState(), {silent: true});
    },
    render: function() {
      var self = this;0

      //If any modals exist, remove the backdrops.
      $(".modal-backdrop").remove()
      return this;
    },
    // returns a defualt help template. This should be overriden to return a more helpful template.
    getHelpTemplate: function () {
      return $("#help-sidebar-template").html();
    },
    // the follow can be overridden if the state is not stored in a Backbone Model called this.state.
    getState: function () {
      return this.state.attributes;
    },
    // the follow can be overridden if the state is not stored in a Backbone Model called this.state.
    setState: function (_state) {
      if(_state){
        this.state.set(_state);
      }
      return this;
    },
    // this is how events are handled with children.  Any events defined in the
    // child of this view should be in "additionalEvents".
    additionalEvents: {},
    originalEvents: {},
    events : function() {
      var evts = _.isFunction(this.additionalEvents)? this.additionalEvents.call(this) : this.additionalEvents;
      return _.extend({},this.originalEvents,evts);
    },
    getDefaultState: function () {
      console.error("getDefaultState() for " + this.info.name + " needs to be overridden");
    }
  });

  return MainView;
});

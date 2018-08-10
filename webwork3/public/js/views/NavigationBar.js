define(['jquery','backbone','underscore','views/MessageListView'],
  function($,Backbone,_,MessageListView){

	var NavigationBar = Backbone.View.extend({
    template: $("#menu-bar-template").html(),
    initialize: function(opts){
      var self = this;
      _(this).extend(_(opts).pick("eventDispatcher"));
      this.messagePane = new MessageListView();
      this.eventDispatcher.on("add-message",function(msg){
        if(self.eventDispatcher){
          self.messagePane.addMessage(msg);
        }
      });
    },
		render: function (){
			this.$el.html(this.template);
      this.messagePane.render();
			return this;
		},
		events: {
			"click .manager-menu a.dropdown-item": function(evt){
                // if the icon is clicked on, then need to select the parent.
                var id= $(evt.target).data("id");
                if(typeof(id)==="undefined"){
                    id = $(evt.target).parent().data("id");
                }
                this.eventDispatcher.trigger("change-view",id)
            },
			"click .main-help-button": function(evt){ this.eventDispatcher.trigger("show-help")},
			"click .logout-link": function(evt){      this.eventDispatcher.trigger("logout")},
			"click .stop-acting-link": function(evt){ this.eventDispatcher.trigger("stop-acting")},
			"click #forward-button": function(){      this.eventDispatcher.trigger("forward-page")},
			"click #back-button": function(){         this.eventDispatcher.trigger("back-page")},
      "click #open-sidebar-button": "openSidebar",
      "click #close-sidebar-button": "closeSidebar"
		},
		setPaneName: function(name){
			this.$(".main-view-name").text(name);
		},
		setLoginName: function(name){
			this.$(".logged-in-as").text(name);
		},
		setActAsName: function(name){
			if(name===""){
				this.$(".act-as-user").text("");
				this.$(".stop-acting-li").addClass("disabled");
			} else {
				this.$(".act-as-user").text("("+name+")");
				this.$(".stop-acting-li").removeClass("disabled");
			}
		},
    openSidebar: function(){
      this.eventDispatcher.trigger("open-sidebar");
      this.$("#open-sidebar-button").addClass("hidden");
      this.$("#close-sidebar-button").removeClass("hidden");
    },
    closeSidebar: function(){
      this.eventDispatcher.trigger("close-sidebar");
      this.$("#open-sidebar-button").removeClass("hidden");
      this.$("#close-sidebar-button").addClass("hidden");

    },
    setSideBar: function(opts){
      if(opts.open){
        this.openSidebar();
      } else {
        this.closeSidebar();
      }
    },
    buildViewMenu: function(views){
      var menuItemTemplate = _.template($("#main-menu-item-template").html());
      var ul = this.$(".manager-menu");
      _(views).each(function(_view){
          ul.append(menuItemTemplate({name: _view.info.name, id: _view.info.id,icon: _view.info.icon}));
      });

    }
	});

	return NavigationBar;

});

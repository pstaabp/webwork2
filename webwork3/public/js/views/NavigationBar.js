define(['backbone'], function(Backbone){
	var NavigationBar = Backbone.View.extend({
		render: function (){
			_(this).extend(Backbone.Events);
			this.$el.html($("#menu-bar-template").html());
			return this;
		},
		events: {
			"click .manager-menu a.link": function(evt){
                    // if the user clicks on the icon.  (Note: why isn't this taken care of automatically
                    // through the passing of click events?) 
                    var targ = $(evt.target).hasClass("fa") ? $(evt.target).parent() : $(evt.target); 
                    this.trigger("change-view",targ.data("id"))
            },
			"click .main-help-button": function(evt){
				this.trigger("show-help")},
			"click .logout-link": function(evt){ this.trigger("logout")},
			"click .stop-acting-link": function(evt){ this.trigger("stop-acting")},
			"click .forward-button": function(){ this.trigger("forward-page")},
			"click .back-button": function(){ this.trigger("back-page")},
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
		}
	});

	return NavigationBar; 

});

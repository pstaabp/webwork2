/*
*  This is the main view for the Library Browser within the the Homework Manager.
*
*
*/


define(['jquery','backbone', 'underscore','views/TabbedMainView',
        'views/library-views/LibrarySubjectView','views/library-views/LibraryDirectoryView',
        'views/library-views/LibrarySearchView','views/library-views/LocalLibraryView',
        'views/library-views/LibraryTextbookView','models/ProblemSet',
        'models/User','moment','config','apps/util'],
function($,Backbone, _,TabbedMainView,LibrarySubjectView,LibraryDirectoryView, LibrarySearchView,
    LocalLibraryView,LibraryTextbookView,ProblemSet,User,moment,config,util){
    var LibraryBrowser = TabbedMainView.extend({
        messageTemplate: _.template($("#library-messages-template").html()),
    	initialize: function (options){
    		var self = this;
            _.bindAll(this,'render','updateNumberOfProblems');
            this.dateSettings = util.pluckDateSettings(options.settings);
            var viewOptions = {problemSets: options.problemSets,settings: options.settings, parent: this,
                    messageTemplate: this.messageTemplate, eventDispatcher: options.eventDispatcher};

            options.views = {
                subjects : new LibrarySubjectView(_.extend({},viewOptions,{libBrowserType: "subjects"})),
                directories : new LibraryDirectoryView(_.extend({},viewOptions,{libBrowserType: "directories"})),
                textbooks : new LibraryTextbookView(_.extend({},viewOptions,{libBrowserType: "textbooks"})),
                localLibrary : new LocalLibraryView(_.extend({},viewOptions,{libBrowserType: "localLibrary"})),
                setDefinition : new LocalLibraryView(_.extend({},viewOptions,{libBrowserType: "setDefinition"})),
                search :  new LibrarySearchView(_.extend({},viewOptions,{libBrowserType: "search"})),
                pending: new LocalLibraryView(_.extend({},
                                       viewOptions,{libBrowserType: "pending", tabName: "Pending", editTags: true}))
            };
            options.views.setDefinition.tabName = "Set Defn. files";
            TabbedMainView.prototype.initialize.call(this,options);
            this.eventDispatcher.on("sidebar-changed",function(sb){
                self.state.set("sidebar",sb.info.id);
            });
    	},
        render: function (){
            TabbedMainView.prototype.render.call(this);
            this.$el.append("<div class='edit-tags-container'></div>");
        },
        changeTab: function(options){
            TabbedMainView.prototype.changeTab.apply(this,[options]);
            if(this.sidebar){
                this.sidebar.state.set(this.views[this.state.get("tab_name")]
                                       .tabState.pick("show_tags","show_path"));
            }
        },
        getHelpTemplate: function(){
            return $("#library-help-template").html();
        },
        sidebarEvents: {
            "change-display-mode": function(evt) {
                this.state.set("display_mode",$(evt.target).val());
                this.views[this.state.get("tab_name")].changeDisplayMode(this.state.get("display_mode"))
            },
            "change-target-set": function(opt) {
                var setID = _.isString(opt)? opt: $(opt.target).val();
                this.state.set("target_set_id",setID);
                this.views[this.state.get("tab_name")].setTargetSet(setID);
            },
            "add-problem-set": function(_set_name){
                var _set = new ProblemSet({set_id: _set_name},this.dateSettings);
                // why is 10 days from now the default.  This should be a setting.
                _set.setDefaultDates(moment().add(10,"days")).set("assigned_users",[config.courseSettings.user]);
               this.views[this.state.get("tab_name")].problemSets.add(_set);
            },
            "show-hide-tags": function(_show) {
                this.state.set("show_tags",_show);
            },
            "show-hide-path": function(_show) {
                this.state.set("show_path",_show);
            },
            "show-hide-hints": function(_show) {
                this.state.set("show_hints",_show);
            },
            "show-hide-solution": function(_show) {
                this.state.set("show_solution",_show);
            },
            "goto-problem-set": function(_setName){
                this.eventDispatcher.trigger("show-problem-set",_setName);
            }

        },
        updateNumberOfProblems: function (text) {
            this.headerView.$(".number-of-problems").html(text);
        },
        getDefaultState: function(){
            //return TabbedMainView.prototype.getDefaultState.apply([]);
            var state = TabbedMainView.prototype.getDefaultState.apply(this,[]);
               return _.extend(state,{ target_set_id: "", show_path: false, show_tags: false, display_mode: "",
                                     sidebar: ""});
        }
    });

    return LibraryBrowser;
});

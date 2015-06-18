/**
*  This view is the interface to the Library Tree and allows the user to more easier navigate the Library. 
*
*  To use the LibraryTreeView the following parameters are needed:
*  type:  the type of library needed which is passed to the Library Tree
*  
*
*/

define(['backbone', 'underscore','models/LibraryTree','stickit','backbone-validation'], 
    function(Backbone, _,LibraryTree){
	
    var LibraryTreeView = Backbone.View.extend({
    	initialize: function (options){
    		_.bindAll(this,"render","loadProblems","changeLibrary");
            var self = this;
            this.libraryTree = new LibraryTree({type: options.type});
            this.libraryTree.set("header",options.type==="textbooks"?"textbooks/":"Library/");
            // this is the library view that contains this view. 
            this.libraryView = options.libraryView || console.error("libraryView must be defined");
            (this.fields = new LibraryLevels()).type = options.type;
            this.fields.on("change",this.changeLibrary);

            this.libraryLevel=[[],[],[],[]];
            this.bindings = {};
            for(var i = 0; i<4;i++) {
                this.bindings[".library-level-"+i+ " select"]= {observe: "level"+i,
                    selectOptions: {collection: function (view,opts) { 
                        return self.libraryLevel[opts.observe.split("level")[1]||""]},
                    defaultOption: {label: options.topLevelNames[i], value: ""}}};
            }
    	},
    	render: function(){
            var i,branch,numFiles = null;
            this.$el.html($("#library-tree-template").html());
            if (!this.libraryTree.get("tree")) {
                this.libraryTree.fetch({success: this.render});

            } else {
                this.$(".throbber").remove();
                this.$(".library-tree-left").html($("#library-select-template").html());
                this.changeLibrary(this.fields);
            }
            
            return this; 
    	},
        events: { "click .load-library-button": "selectLibrary"},
        changeLibrary: function(model){
            if(typeof(this.libraryTree.get("tree"))==="undefined" || _(model).keys().length===0){
                return;
            }
            // When the library subject/chapter/section is changed, reset all lower ones
            var i, level;
            
            if(_(model.changed).keys().length==1){
                var key = _(model.changed).keys()[0]
                var value = model.changed[key];
                if(!_.isEmpty(value)){
                    level = 1+parseInt(key.replace("level",""));
                    this.libraryView.tabState.set("page_num",0);
                }
                
            } else {

                var keys= _(model.attributes).keys()
                var nonEmptyKeys = _(model.attributes).chain().keys().filter(function(k){
                                return !_.isEmpty(model.get(k))}).value();
                if (nonEmptyKeys.length == 0) {
                    level = 0;
                } else {
                    level = 1+ _(nonEmptyKeys).chain().map(function(k) { 
                                return parseInt(k.replace("level",""));}).max().value()
                }
            }
          
            var numFiles, arr, branch = this.branchOfTree([]);
            this.libraryLevel[0] = branch.branches;
            for(i=0;i<level;i++){
                arr = _(model.attributes).values().slice(0,i+1);
                branch = this.branchOfTree(arr);
                this.libraryLevel[i+1] = branch.branches;
                numFiles = branch.num_files;
            }

            for(i=0;i<4;i++){
                this.$(".library-level-"+i).addClass("hidden");  // hide all levels. 
            }
            for(i=0;i<level+1;i++){
                this.$(".library-level-"+i).removeClass("hidden");  // show needed levels.
            }
            if(this.libraryLevel[level].length==0){
                this.$(".library-level-"+level).addClass("hidden");
            }
            for(i=level;i<4;i++){
                this.fields.set("level"+i,"",{silent:true});   
            }

            this.$(".load-library-button").text(numFiles? "Load " + numFiles + " problems": "Load");  
            this.unstickit(this.fields);
            this.stickit(this.fields,this.bindings);
        },
        selectLibrary: function(evt){
            this.libraryTree.trigger("library-selected",_(this.fields.values()).without(""));
        },
        loadProblems: function (evt) {
            var path = _(this.$(".lib-select")).map(function(item){ return $(item).val()});
            if (this.$(".lib-select").last().val()==="Choose A Library") {path.pop();}
            this.parent.dispatcher.trigger("load-problems",this.libraryTree.header+path.join("/"));
        },
        branchOfTree: function(path){
            var tree = this.libraryTree.get("tree");
            if(_(path).compact().length ===0){
                return {branches: _(tree).pluck("name"), 
                        num_files: _(tree).reduce(function(i,j) { return i+parseInt(j.num_files);},0) };
            }
            var currentBranch=tree;
            var numFiles;
            _(path).each(function(p,i){
                if(p.length>0){
                    var branch = _(currentBranch).findWhere({name:p});
                    if(typeof(branch)!=="undefined") {
                        currentBranch = branch.subfields;
                        numFiles = branch.num_files;
                    }
                }
            });
            return {branches: _(currentBranch).map(function(s) { return {label: s.name, value: s.name};}), 
                num_files: numFiles};
        }
    });

    var LibraryLevels = Backbone.Model.extend({
        defaults:  { 
            level0: "",
            level1: "",
            level2: "",
            level3: "",
        },
        validation: {
            level0: "checkLevel",
            level1: "checkLevel"
        },
        checkLevel: function() {
            if(this.type==="subjects" && this.get("level0")===""){
                return "Error!";
            } else if (this.type==="directories" && this.get("level0")===""){
                return "level-0-error";
            } else if (this.type==="directories" && this.get("level1")===""){
                return "level-1-error";
            }
        },
        
    });

    return LibraryTreeView;

});

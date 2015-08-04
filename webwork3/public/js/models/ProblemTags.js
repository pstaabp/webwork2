define(['backbone', 'underscore', 'config', 'apps/util'], function(Backbone, _, config,util){
    /**
     *
     * This stores the Problem Tags for a problem 
     * 
     * @type {*}
     */
    var ProblemTags = Backbone.Model.extend({
        defaults:{ 
            Level: 1,
            keywords:[],
            Status:"",
            Static:"",
            MLTleader:"",
            MLT: "",
            MO:"",
            resources:[],
            Author:"",
            Date:"",
            DBsubject:"",
            DBchapter:"",
            DBsection:"",
            textinfo:[],
            file:"",
            Institution:"",
            Language:"",
        }
    });

    
    return ProblemTags;
});
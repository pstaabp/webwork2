/**
*  This file simply sets up a $.fn.bootstrapBtn in jquery to handle the conflict
*  between it and a jquery-ui button.
*
**/


define(['jquery','bootstrap'],function($){
  var bootstrapButton = $.fn.button.noConflict() // return $.fn.button to previously assigned value
  $.fn.bootstrapBtn = bootstrapButton            // give $().bootstrapBtn the Bootstrap functionality
});

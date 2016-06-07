// This is a manifest file that'll be compiled into application.js, which will include all the files
// listed below.
//
// Any JavaScript/Coffee file within this directory, lib/assets/javascripts, vendor/assets/javascripts,
// or any plugin's vendor/assets/javascripts directory can be referenced here using a relative path.
//
// It's not advisable to add code directly here, but if you do, it'll appear at the bottom of the
// compiled file.
//
// Read Sprockets README (https://github.com/rails/sprockets#sprockets-directives) for details
// about supported directives.
//
//= require jquery
//= require tether
//= require bootstrap.min
//= require jquery_ujs
//= require turbolinks
//= require_tree .

// Hide the invitations clicked by the user.
function hideInvit(id) {
    // Get the current number of invitations and substract 1.
    var numberOfInvits = parseInt($("#nbOfInvits").val()) - 1;

    // Hide the element and update the number of invitations.
    $("li[name=invitation" + id + "]").fadeOut("fast");
    $("#btnInvitsText").text("Request to join a trip (" + numberOfInvits + ")");
    $("#nbOfInvits").val(numberOfInvits);
}

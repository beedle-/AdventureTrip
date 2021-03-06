// Place all the behaviors and hooks related to the matching controller here.
// All this logic will automatically be available in application.js.

var MAX_STOPS = 10;
var directionsDisplay;
var directionsService;
var editableMap = false;
var map;
var totalDistance = 0;
var totalDuration = 0;
var coordinatesArray = new Array();
var markersArray = new Array();
var isLoopAndReadOnly = false;

$(document).ready(function() {
    // Set the map editable if the user is located either on the add or edit trip pages.
    if ($("#map").length) {
        editableMap = true;
    }

    var mapAlreadyDisplayedOnce = false;

    // Enable tabs' actions once the page has been successfully loaded.
    $('#tripTabs a').click(function (e) {
        e.preventDefault();
        $(this).tab('show');
    })

    // Calculate the route when the user change the transport in the select element.
    $("#trip_transport_id").change(function() {
        calcRoute();
    })

    // As we work with tabs we have to manually initialize the Google's map when
    // the user clicks on the "Route" tab for the first time.
    $('#route-tab').on('shown.bs.tab', function (e) {
        if (!mapAlreadyDisplayedOnce) {
            mapAlreadyDisplayedOnce = true;
            initMap();
        }
    })

    // Calculate the route if not already done when the user clicks on the "Costs" tab.
    $('#costs-tab').on('shown.bs.tab', function (e) {
        if (mapAlreadyDisplayedOnce) {
            $("#calculateRouteWarning").hide();
            $("#costPerKm, #calculateCostsBtn").prop("disabled", false);
            calculateCosts();
        }
    })

    // Hide comment when destroyed
    $(".comment").on("click", function() {
        $(this).parent().hide();
    })

    // Hide item when destroyed
    $(".item").on("click", function() {
        $(this).parent().hide();
    })
})

// Change the selected participant's status (admin or normal) when the user
// double-clicks on it.
// The user itself cannot remove is own admin rights.
function toggleAdmin(currentUserId) {
    var element = $("#participantsSelect").find(":selected");
    var isAdmin = parseInt(element.attr("admin"));
    var userId = parseInt(element.attr("userId"));

    if (userId == currentUserId && isAdmin) {
        alert("You cannot set yourself as an usual user!");
    } else {
        // If admin the participant become normal.
        if (isAdmin) {
            element.attr("admin", 0);
            element.css("font-weight", "normal");
            element.val("0-" + userId);
        }
        // If normal the participant become admin.
        else {
            element.attr("admin", 1);
            element.css("font-weight", "bold");
            element.val("1-" + userId);
        }
    }
}

// Add a participant to the trip by moving the selected person from "Users" to
// "Participants" in the form.
function addParticipants() {
    $("#usersSelect").find(":selected").each(function() {
        $("#participantsSelect").append($(this));
    })
}

// Remove a participant to the trip by moving the selected person from "Participants"
// "Users" in the form.
function removeParticipants(currentUserId) {
    $("#participantsSelect").find(":selected").each(function() {
        var currentVal = $(this).val();

        if (currentVal.substring(2, currentVal.length) != currentUserId) {
            $("#usersSelect").append($(this));
        } else {
            alert("You cannot remove yourself from the trip!");
        }
    })
}

// Select all participants in order to send them with the form when the user
// clicked on the submit button.
function selectAllParticipants() {
    selectBox = document.getElementById("participantsSelect");

    for (var i = 0; i < selectBox.options.length; i++)
    {
         selectBox.options[i].selected = true;
    }
}

// Convert the given number of seconds to a "HH:MM:SS" format.
function secondsToHours(seconds) {
    var hours   = Math.floor(seconds / 3600);
    var minutes = Math.floor((seconds - (hours * 3600)) / 60);
    var seconds = seconds - (hours * 3600) - (minutes * 60);

    if (hours < 10) {
        hours = "0" + hours;
    }

    if (minutes < 10) {
        minutes = "0" + minutes;
    }

    if (seconds < 10) {
        seconds = "0" + seconds;
    }

    return hours + ":" + minutes + ":" + seconds;
}

// Update the map's instructions so the user know what to do next.
function updateInstructions() {
    switch (coordinatesArray.length) {
        case 0:
            $("#stops-instructions").text("First select the origin of your trip by clicking on the map to the right.");
            $("#stopsOptions").hide();
            break;
        case 1:
            $("#stops-instructions").html("Select the locations you want to stop on the map (<u>MAX " + MAX_STOPS + "!</u>) and press the \"<strong>Calculate route...</strong>\" button when you have at least two locations.");
            $("#stopsOptions").show();
            $("#calculateRoute").hide();
            break;
        case 2:
            $("#calculateRoute").show();
    }
}

// Initializes the existing points on the map when an used edits a trip.
function initExistingPoints() {
    var bounds = new google.maps.LatLngBounds();

    // Deals with each hidden waypoint fields added in _form.html.erb.
    for (var i = 1; i <= ($("input[name^='waypoints']").length / 2); ++i) {
        // Get the current waypoint's latitude and longitude.
        var lat_p = parseFloat($("#waypoint-" + i + "-1").val());
        var lon_p = parseFloat($("#waypoint-" + i + "-2").val());

        // If the last stops equals the first one, we do not add it to the map
        // but check the checkbox instead.
        if (i > 1 && i == ($("input[name^='waypoints']").length / 2) && lat_p == coordinatesArray[0].lat && lon_p == coordinatesArray[0].lng) {
            if ($("#arrivalEqualsStart").length) {
                $("#arrivalEqualsStart").prop("checked", true);
                $("input[name^='waypoints[" + (i - 1) + "]']").remove();
            // If the user accessed the map through the "Show" page there is no
            // checkbox so we still need to indicate the system there is a loop.
            } else {
                isLoopAndReadOnly = true;
            }
        } else {
            // Add the point in the coordinates array.
            coordinatesArray.push({lat: lat_p, lng: lon_p});
            // Add the point on the map.
            markersArray.push(new google.maps.Marker({
                position: {lat: lat_p, lng: lon_p},
                map: map,
                label: (coordinatesArray.length - 1).toString()
            }));
        }

        // Updates text instructions.
        updateInstructions();
    }

    // Calculates the route.
    calcRoute();
}

// Initialize the Google Maps' map
function initMap() {
    var mapObject = editableMap ? document.getElementById("map") : document.getElementById("mapTripDetails");

    // Initialize direction service and renderer, which will be used to calculate
    // routes between points.
    directionsService = new google.maps.DirectionsService();
    // Remove routes' markers to avoid them overlapping markers of the user.
    directionsDisplay = new google.maps.DirectionsRenderer({suppressMarkers: true});

    // Initialize the map.
    var mapOptions = {
        zoom: 7,
        center: new google.maps.LatLng(46.869395, 8.328190)
    }
    map = new google.maps.Map(mapObject, mapOptions);

    // Change the mouse's cursor if the map is editable to be more precise when
    // pointing places.
    if (editableMap)
        map.setOptions({draggableCursor:'default'});

    // Set the map for the directions' displaying.
    directionsDisplay.setMap(map);

    // Add a marker on the map when the user clicks on it, if it is editable.
    // Also save the marker's coordinates to calculate the route.
    // Only possible if there is not more than 10 points yet.
    if (editableMap) {
        map.addListener("click", function(e) {
            // Google Maps API doesn't allow us to have more than a maximum number
            // of points per route. This value is currently 10.
            if (coordinatesArray.length < MAX_STOPS) {
                // As the checkbox counts as an extra stop we have to disable it if
                // there is already too much stop on the map.
                if (coordinatesArray.length == MAX_STOPS - 1) {
                    $("#arrivalEqualsStart").prop("checked", false);
                    $("#arrivalEqualsStart").prop("disabled", true);
                    // Display a tooltip on the checkbox to warn the user.
                    $("#arrivalEqualsStart").attr("title", "Please remove a stop if you want to check this checkbox.");
                    $("#arrivalEqualsStartText").attr("title", "Please remove a stop if you want to check this checkbox.");
                    $("#arrivalEqualsStartText").tooltip('show');
                }

                coordinatesArray.push(e.latLng);
                markersArray.push(new google.maps.Marker({
                    position: e.latLng,
                    map: map,
                    label: (coordinatesArray.length - 1).toString()
                }));

                // Add two hidden inputs to the form, indicating the new entered coordinates.
                // Latitude
                $('<input>').attr({
                    type:   'hidden',
                    id:     'waypoint-' + coordinatesArray.length + '-1',
                    name:   'waypoints[' + (coordinatesArray.length - 1) + '][]',
                    value:  e.latLng.lat()
                }).appendTo('form');
                // Longitude
                $('<input>').attr({
                    type:   'hidden',
                    id:     'waypoint-' + coordinatesArray.length + '-2',
                    name:   'waypoints[' + (coordinatesArray.length - 1) + '][]',
                    value:  e.latLng.lng()
                }).appendTo('form');

                updateInstructions();
            } else {
                alert("You can't exceed the maximum number of points per trip (" + MAX_STOPS + ").\nPlease remove some of them in order to be able to add some new.");
            }
        })
    }

    initExistingPoints();
}

// Calculate the given route and display it on the map.
function calcRoute() {
    if (coordinatesArray.length > 1) {
        // In case the user removed a point on an already-calculated route we had
        // to erase it by setting the directionDisplay object's map to null.
        // Thus, we have to set the map again.
        directionsDisplay.setMap(map);

        var selectedMode;
        var waypoints = new Array();
        var arrival = null;

        // Get the selected mode with the select value or the displayed text,
        // depending on the current action (edit or add a trip).
        if (editableMap) {
            selectedMode = $("#trip_transport_id").find(":selected").text().toUpperCase();
        } else {
            selectedMode = $("#transport_name").text().toUpperCase();
        }

        // Build the waypoints of the route, taking off the start and the
        // arrival points.
        for (var i = 1; i < coordinatesArray.length - 1; ++i) {
            waypoints.push({
                "location": coordinatesArray[i],
                stopover: true
            })
        }

        // Get the trip's arrival, based on whether the user checked or not
        // the checkbox.
        if ($('#arrivalEqualsStart').is(':checked') || isLoopAndReadOnly) {
            // The last coordinates of the array is not the arrival so we have
            // to add it in the waypoints.
            waypoints.push({
                "location": coordinatesArray[coordinatesArray.length - 1],
                stopover: true
            })

            // Arrival equals the start.
            arrival = coordinatesArray[0];
        } else {
            // Otherwise the arrival equals the last coordinates point.
            arrival = coordinatesArray[coordinatesArray.length - 1];
        }

        var request = {
            origin: coordinatesArray[0],
            destination: arrival,
            waypoints: waypoints,
            // Note that Javascript allows us to access the constant using
            // square brackets and a string value as its "property."
            travelMode: google.maps.TravelMode[selectedMode]
        };

        directionsService.route(request, function(response, status) {
            if (status == google.maps.DirectionsStatus.OK) {
                directionsDisplay.setDirections(response);

                // Calculate route's total distance and duration.
                var legs = response.routes[0].legs;

                // Iterate over each route's "legs", which means each the path
                // between each route's markers.
                for (var i = 0; i < legs.length; ++i) {
                    // Distance in meters.
                    totalDistance += legs[i].distance.value;
                    // Duration is seconds.
                    totalDuration += legs[i].duration.value;
                }

                // Get the distance in kilometers.
                totalDistance = Math.round(totalDistance / 10) / 100

                $('#distance').html("Distance: <strong>" + totalDistance + " km</strong>");
                $('#duration').html("Duration in hours: <strong>" + secondsToHours(totalDuration) + "</strong>");
            }
        });
    } else if (editableMap) {
        alert("Please select at least two locations.");
    }
}

// Remove the last entered trip's stop.
function removeLastStop() {
    // There must be at least one stop to remove and the map must be editable.
    if (editableMap && markersArray.length > 0) {
        // Enable the checkbox if it has been disabled before.
        $("#arrivalEqualsStart").prop("disabled", false);
        // Hide the perhaps-displayed tooltip on the checkbox.
        $("#arrivalEqualsStart").attr("title", "Check me if you want your trip to be a loop.");
        $("#arrivalEqualsStartText").attr("title", "Check me if you want your trip to be a loop.");
        $("#arrivalEqualsStartText").tooltip('hide');

        // Remove the marken and the coordinates.
        markersArray[markersArray.length - 1].setMap(null);
        markersArray.pop();
        coordinatesArray.pop();

        // Remove the corresponding hidden input from the form.
        $("#waypoint-" + (coordinatesArray.length + 1) + "-1").remove();
        $("#waypoint-" + (coordinatesArray.length + 1) + "-2").remove();

        // Remove the eventually calculated route if the used removes a coordinate.
        directionsDisplay.setMap(null);
        $('#distance').text("");
        $('#duration').text("");

        updateInstructions();
    }
}

function calculateCosts() {
    var costs = parseFloat($("#costPerKm").val());

    if (!isNaN(costs)) {
        $("#tripCosts").text("CHF " + (Math.round(totalDistance * costs * 100) / 100));
    } else {
        $("#tripCosts").text("-");
    }
}

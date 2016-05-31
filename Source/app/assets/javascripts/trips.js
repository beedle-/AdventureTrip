// Place all the behaviors and hooks related to the matching controller here.
// All this logic will automatically be available in application.js.

var directionsDisplay;
var directionsService;
var map;
var haight;
var oceanBeach;
var coordinatesArray = new Array();
var markersArray = new Array();

$(document).ready(function() {
    // Enable tabs' actions once the page has been successfully loaded.
    $('#tripTabs a').click(function (e) {
        e.preventDefault();
        $(this).tab('show');
    })
    
    $("#trip_transport_id").change(function() {
        calcRoute();
    })
})

// Update the map's instructions so the user know what to do next.
function updateInstructions() {
    switch (coordinatesArray.length) {
        case 0:
            $("#stops-instructions").text("First select the origin of your trip by clicking on the map to the right.");
            $("#stopsOptions").hide();
            break;
        case 1:
            $("#stops-instructions").text("Then select the locations you want to stop on the map and press the \"Calculate route...\" button when you're done.");
            $("#stopsOptions").show();
            $("#calculateRoute").hide();
            break;
        case 2:
            $("#calculateRoute").show();
    }
}

// Initialize the Google Maps' map
function initMap() {
    // Initialize direction service and renderer, which will be used to calculate
    // routes between points.
    directionsService = new google.maps.DirectionsService();
    directionsDisplay = new google.maps.DirectionsRenderer();

    haight = new google.maps.LatLng(37.7699298, -122.4469157);
    oceanBeach = new google.maps.LatLng(37.7683909618184, -122.51089453697205);

    // Initialize the map.
    var mapOptions = {
        zoom: 14,
        center: haight
    }
    map = new google.maps.Map(document.getElementById("map"), mapOptions);

    // Set the map for the directions' displaying.
    directionsDisplay.setMap(map);

    // Add a marker on the map when the user clicks on it.
    // Also save the marker's coordinates to calculate the route.
    map.addListener("click", function(e) {
        coordinatesArray.push(e.latLng);
        markersArray.push(new google.maps.Marker({
            position: e.latLng,
            map: map,
            label: coordinatesArray.length.toString()
        }));

        updateInstructions();
    })
}

// Calculate the given route and display it on the map.
function calcRoute() {
    if (coordinatesArray.length > 1) {
        //var selectedMode = document.getElementById("mode").value;
        var selectedMode = $("#trip_transport_id").find(":selected").text().toUpperCase();
        var waypoints = new Array();
        var arrival = null;

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
        if ($('#arrivalEqualsStart').is(':checked')) {
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
            }
        });
    } else {
        alert("Please select at least two locations.");
    }
}

// Remove the last entered trip's stop.
function removeLastStop() {
    // There must be at least one stop to remove.
    if (markersArray.length > 0) {
        // Remove the marken and the coordinates.
        markersArray[markersArray.length - 1].setMap(null);
        markersArray.pop();
        coordinatesArray.pop();

        updateInstructions();
    }
}

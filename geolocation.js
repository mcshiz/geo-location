/**
 * Created by brian on 12/11/15.
 */


// get location of user by geo location
$(document).ready(function(){
    var myLocation; // global variable to store lat/lng
    if (navigator && navigator.geolocation) {
        // HTML5 GeoLocation
        function getLocation(position) {
            $.cookie('geoLocation', 'true');
            if($('div.locationWarning')) {
                removeWarning();
            }
            myLocation = {
                "lat": position.coords.latitude,
                "lng": position.coords.longitude
            };
            initMap(myLocation);
        }
        function error(err) {
            geoLocationError(err)
        }
        navigator.geolocation.getCurrentPosition(getLocation, error);
    } else {

    }
});

function geoLocationError(err) {
    $.cookie('geoLocation', 'false');
    myLocation = {
        "lat": 42.877742,
        "lng": -97.380979
    };
    var options = {
        zoom: 3,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        scrollwheel: false
    };
    initMap(myLocation, options);
    if (err.code === 1) {
        $('#prepopulated').text("Wholesale Solar wants to use your location so we can populate this form with numbers specific to your area. Pick your location on the map above or type in an address.").css({
            'font-size': '1.5em',
            'visibility': 'visible',
            'color': '#fe7800'
        });
    }
}

// initialize map with location from above
var map;
var markersArray = [];
function initMap(myLocation, options) {
    if(!options) {
        var options = {
            zoom: 8,
            center: myLocation,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            scrollwheel: false
        };
    }
    map = new google.maps.Map(document.getElementById("map"), options);
    // set initial place marker
    placeMarker(myLocation, true);
    // add a click event handler to the map object
    google.maps.event.addListener(map, "click", function(event){
        placeMarker(event.latLng);
        dataLayer.push({'event': 'mapsClick'});
    });

}
// add marker to map
function placeMarker(newLocation, initalCall) {
    deleteOverlays();
    needToRecalculate();
    var marker = new google.maps.Marker({
        position: newLocation,
        draggable: true,
        map: map
    });
    // add marker in markers array
    markersArray.push(marker);
    // center map on new marker
    map.setCenter(newLocation);
    // get data for new marker location
    // if this is the initial call dont get geoLocationData again
    getData(newLocation, initalCall);
    // attach drag listener to this new marker
    google.maps.event.addListener(marker, "dragend", function(event){
        placeMarker(event.latLng);
    });
}

// Deletes all markers in the array by removing references to them
function deleteOverlays() {
    if (markersArray) {
        for (i in markersArray) {
            markersArray[i].setMap(null);
        }
        markersArray.length = 0;
    }
}

function geoCode(e) {
    e.preventDefault();
    e.stopPropagation();

    var input = $('input[name="zipCode"]');
    if(input.val() === "") {
        return;
    }
    var address = input.val().replace(/\s/gi, '+');
    address = address.replace(/['"]/gi, '');
    $.ajax({
        url: "https://maps.googleapis.com/maps/api/geocode/json?address="+address+"&key=AIzaSyBqwyE-0tC9-bUGR6xovO-c0pEZB1e2Pu0",
        type: 'GET',
        dataType: 'json',
        error: function (request, status, error) {
        },
        success: function (data) {
            if(data.status !== "ZERO_RESULTS") {
                var tmpObj = {};
                tmpObj.lat = data.results[0].geometry.location.lat;
                tmpObj.lng = data.results[0].geometry.location.lng;
                placeMarker(tmpObj);
                tmpObj = {};
            } else {
            input.val("");
            input.attr('placeholder', 'NO RESULTS FOUND, TRY AGAIN')
            }
        }
    });
}

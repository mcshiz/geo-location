    var GeoLocation = (function() {
        var options = {
            enableHighAccuracy : true,
                timeout : 3000,
                maximumAge : 0
        };
        function getLocation(position) {
            document.cookie = "geoLocation=true";
            GeoLocation.userLocation = {
                lat: position.coords.latitude,
                lng: position.coords.longitude };
        }
        function fallback() {
            $.getJSON('//freegeoip.net/json/', function (data) {
                // sometimes ClientLocation comes back null
                    GeoLocation.userLocation = {
                        lat: data.latitude,
                        lng: data.longitude
                    };

            })
            .fail(function() {
                console.log('geolocation failed resorting to default.');
            })
        }

        function error(error) {
            document.cookie = "geoLocation=false";
            console.log(error.message);
            fallback();
        }

        if (navigator && navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(getLocation, error, options);
        } else {
            fallback();
        }

        return {
            //setting default
            userLocation : {
                lat: 42.877742,
                lng: -97.367445640979
            }
        }
    })();

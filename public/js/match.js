$(document).ready(function () {
	var socket = io.connect('https://localhost:4433');
	var currgeocoder;
	var iploc;
	var currentloc = [];
	socket.on("iplocation", function (data) {
			iploc = (data.location);
			initializeCurrent(iploc[0], iploc[1]);
		})
		//Set geo location lat and long
	navigator.geolocation.getCurrentPosition(function (position, html5Error) {
		geo_loc = processGeolocationResult(position);
		currLatLong = geo_loc.split(",");
		if (currLatLong) {
			initializeCurrent(currLatLong[0], currLatLong[1]);
		}
		else {}
	});
	//Get geo location result
	function processGeolocationResult(position) {
		html5Lat = position.coords.latitude; //Get latitude
		html5Lon = position.coords.longitude;
		html5TimeStamp = position.timestamp; //Get timestamp
		html5Accuracy = position.coords.accuracy; //Get accuracy in meters
		return (html5Lat).toFixed(8) + ", " + (html5Lon).toFixed(8);
	}
	//Check value is present or not & call google api function
	function initializeCurrent(latcurr, longcurr) {
		currgeocoder = new google.maps.Geocoder();
		if (latcurr != '' && longcurr != '') {
			var myLatlng = new google.maps.LatLng(latcurr, longcurr);
			return getCurrentAddress(myLatlng, latcurr, longcurr);
		}
	}
	//Get current address
	function getCurrentAddress(location, latcurr, longcurr) {
		currgeocoder.geocode({
			'location': location
		}, function (results, status) {
			if (status == google.maps.GeocoderStatus.OK) {
				currentloc.push(results[0].formatted_address);
				socket.emit("location", {
					location: currentloc
					, lat: latcurr
					, long: longcurr
				});
			}
			else {
				alert('Geocode was not successful for the following reason: ' + status);
			}
		});
	}
});
var table = $('table');
$('#location, #popscore , #age, #firstname, #tags').wrapInner('<span title="sort this column"/>').each(function () {
	var th = $(this)
		, thIndex = th.index()
		, inverse = false;
	th.click(function () {
		table.find('td').filter(function () {
			return $(this).index() === thIndex;
		}).sortElements(function (a, b) {
			if (Number($.text([a])) && Number($.text([b]))) {
				return $.text([a]) - $.text([b]) > 0 ? inverse ? -1 : 1 : inverse ? 1 : -1;
			}
			else {
				return $.text([a]) > $.text([b]) ? inverse ? -1 : 1 : inverse ? 1 : -1;
			}
		}, function () {
			return this.parentNode;
		});
		inverse = !inverse;
	});
});

$(document).ready(function () {
	var socket = io.connect('https://localhost:4433');
	var url = document.location.pathname;
		var user = url.split("/")[2];
	socket.emit("new visitor",{user:user} );
});
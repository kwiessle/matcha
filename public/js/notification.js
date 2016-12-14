$(document).ready(function () {

    var socket = io.connect('https://localhost:4433');

    socket.on("notification", function (data) {

        var notif = document.getElementById("notification");

        notif.innerHTML = data.notification;
    })
    socket.on("new Notification", function (data) {
        var notif = document.getElementById("notification").innerHTML;
        var value = parseInt(notif, 10);
        data.value = parseInt(data.value, 10);
        console.log(data.value + "  " + value);
        if (value !== data.value) {
            var newvalue = value + (data.value - value);
            document.getElementById("notification").innerHTML = newvalue;
        }

    })
    $("form input[name=pov]").click(function () {
        var url = document.location.pathname;
        var user = url.split("/")[2];
        socket.emit('likeEvent', {
            value: $(this).val(),
            user: user
        });
    });
});

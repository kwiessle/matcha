$(document).ready(function () {
    var socket = io.connect('https://localhost:4433');



    var url = document.location.pathname.split('/')[2];
    console.log(url);
    socket.emit('check_message', url);




    socket.on("new_message", function (data) {
        for (var k in data) {
            document.getElementById("msgtpl").append(data[k].message);
            console.log(data[k]);
        }
    })

});

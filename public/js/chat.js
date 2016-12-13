$(document).ready(function () {
    var socket = io.connect('https://localhost:4433');
    var url = document.location.pathname.split('/')[2];
    var sessionUser = $("#sessionUser").text();

    socket.emit('infos-chat-request', [url, sessionUser]);

    socket.on('info-chat', function (data) {
        console.log(data);
    })

    $("#form").attr("action", "/sendmessage/" + url);
    socket.emit('check_message', url);
    socket.on("new_message", function (data) {
        for (var k in data) {
            if (data[k].sender === sessionUser) {
                $('<div class="my-message"></div>').text(data[k].message).appendTo("#msgtpl");
            } else {
                $('<div class="contact-message"></div>').text(data[k].message).appendTo("#msgtpl");
            }
        }
    })
});
$(document).ready(function () {
    var socket = io.connect('https://localhost:4433');
    var url = document.location.pathname.split('/')[2];
    var sessionUser = $("#sessionUser").text();
    var myPic = "/" + $("#my-pic").text();
    var contactPic = '';


    

    socket.emit('infos-chat-request', {
        room: url,
        user: sessionUser
    });

    socket.on('info-chat', function (data) {
        $('<div class="guest-name"></div>').text(data.guest).appendTo(".guest");
        contactPic = data.pic;
    })


    $("#form").attr("action", "/sendmessage/" + url);
    socket.emit('check_message', url);
    socket.on("new_message", function (data) {
        for (var k in data) {
            if (data[k].sender === sessionUser) {
                $('<img class="chatter-pic mypic" src="' + myPic + '">').appendTo("#msgtpl");
                $('<img class="bulle mybulle" src="/img/my-bulle.png">').appendTo("#msgtpl");
                $('<div id="' + k + '"class="my-message"></div><br>').text(data[k].message).appendTo("#msgtpl");
                $('<div class="block"></div><br>').appendTo("#msgtpl");
            } else {
                $('<img class="chatter-pic guest-pic" src="/' + contactPic + '">').appendTo("#msgtpl");
                $('<img class="bulle guestbulle" src="/img/contact-bulle.png">').appendTo("#msgtpl");
                $('<div id="' + k + '"class="contact-message"></div><br>').text(data[k].message).appendTo("#msgtpl");
                $('<div class="block"></div><br>').appendTo("#msgtpl");
            }
        }
        $('#msgtpl').animate({
            scrollTop: $('#msgtpl').prop('scrollHeight')
        }, 500)
    })

});

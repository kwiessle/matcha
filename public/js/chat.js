(function ($) {
    $(document).ready(function () {
        var socket = io.connect('https://localhost:4433');
        var url = document.location.pathname.split('/')[2];
        var sessionUser = $("#sessionUser").text();
        var myPic = "/" + $("#my-pic").text();
        var contactPic = '';

        $('#message').focus();
        window.onload = function () {
            if (url) {
                socket.emit("seen message", {
                    room: url,
                    user: sessionUser,
                    notif: document.getElementById("notif" + url).innerHTML
                });

            }
        }

        socket.emit('infos-chat-request', {
            room: url,
            user: sessionUser
        });

        socket.on('info-chat', function (data) {
            $('<div class="guest-name"></div>').text(data.guest).appendTo(".guest");
            contactPic = data.pic;
        })

        $(document).ready(function () {
            $('input#send').on({
                click: function (e) {
                    if ($('#message').val() !== '') {
                        socket.emit('send-message', {
                            text: $('#message').val(),
                            user: sessionUser,
                            room: url
                        });
                    }
                    $('#message').val('');
                    $('#message').focus();
                }
            });
        });
        socket.on("new_message", function (data) {
            console.log(data);
            if (data.room === url) {
                document.getElementById("notif" + data.room).innerHTML = 0;
                if (data.sender === sessionUser) {
                    $('<img class="chatter-pic mypic" src="' + myPic + '">').appendTo("#msgtpl");
                    $('<img class="bulle mybulle" src="/img/my-bulle.png">').appendTo("#msgtpl");
                    $('<div class="my-message"></div><br>').text(data.message).appendTo("#msgtpl");
                    $('<div class="block"></div><br>').appendTo("#msgtpl");
                } else {
                    $('<img class="chatter-pic guest-pic" src="/' + contactPic + '">').appendTo("#msgtpl");
                    $('<img class="bulle guestbulle" src="/img/contact-bulle.png">').appendTo("#msgtpl");
                    $('<div class="contact-message"></div><br>').text(data.message).appendTo("#msgtpl");
                    $('<div class="block"></div><br>').appendTo("#msgtpl");
                }
                $('#msgtpl').animate({
                    scrollTop: $('#msgtpl').prop('scrollHeight')
                }, 500);
            }
        });



        socket.emit('check_message', url);
        socket.on("old_message", function (data) {
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

        socket.on("notification", function (data) {
            var notif = document.getElementById("notification");
            notif.innerHTML = data.notification;
        });
        socket.on("new Notification", function (data) {
            var notif = document.getElementById("notification").innerHTML;
            var value = parseInt(notif, 10);
            data.contactnotif = parseInt(data.contactnotif, 10);
            data.value = parseInt(data.value, 10);
            if (!data.room) {
                if (value !== data.value) {
                    var newvalue = value + (data.value - value);
                    document.getElementById("notification").innerHTML = newvalue;
                }
            } else if (data.room) {
                var contactnotif = document.getElementById("notif" + data.room).innerHTML;
                var contactnotifvalue = parseInt(contactnotif, 10);
                if (data.room === url) {
                    socket.emit("seen message", {
                        room: url,
                        user: sessionUser,
                        notif: document.getElementById("notif" + url).innerHTML
                    })
                } else if (data.room !== url) {
                    if (value !== data.value) {
                        var newvalue = value + (data.value - value);
                        document.getElementById("notification").innerHTML = newvalue;
                    }
                    if (contactnotifvalue !== parseInt(data.contactnotif, 10)) {
                        var newcontactnotifvalue = contactnotifvalue + (parseInt(data.contactnotif, 10) - contactnotifvalue);
                        document.getElementById("notif" + data.room).innerHTML = newcontactnotifvalue;
                    }
                }
            }
        });
        socket.on("message update", function (data) {
            if (url === data.room) {
                var value = parseInt(data.notif, 10);
                var notifvalue = parseInt(document.getElementById("notification").innerHTML, 10);
                document.getElementById("notif" + data.room).innerHTML = 0;
                document.getElementById("notification").innerHTML = notifvalue - value;
            }
        });
    });
})(jQuery);

(function ($) {
    var socket = io.connect('http://localhost:1234');
    var msgtpl = $('#msgtpl').html();
    var lastmsg = false;
    $('#msgtpl').remove();
    $('#loginform').submit(function (event) {
        event.preventDefault();
        socket.emit('login', {
            username: $('#username').val()
            , mail: $('#mail').val()
        })
    });
    socket.on('logged', function () {
        $('#login').fadeOut();
        $('#message').focus();
    });
    /*envoie de messages*/
    $('#form').submit(function (event) {
        event.preventDefault();
        socket.emit('newmsg', {
            message: $('#message').val()
        });
        $('#message').val('');
        $('#message').focus();
    })
    socket.on('newmsg', function (message) {
        if (lastmsg != message.user.id) {
            $('#chatter').append('<div class=separator></div>')
        }
        lastmsg = message.user.id;
        $('#chatter').append('<div class="chat b1">' + Mustache.render(msgtpl, message) + '</div>');
        $('#chatter').animate({
            scrollTop: $('#chatter').prop('scrollHeight')
        }, 500);
    });
    /* GESTION DES CONNECTES*/
    socket.on('newuser', function (user) {
        $('#users').append('<img src="' + user.avatar + '" id="' + user.id + '">');
    });
    socket.on('disuser', function (user) {
        $('#' + user.id).remove();
    });
})(jQuery);
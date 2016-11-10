(function ($) {
    var socket = io.connect('http://localhost:1234');
    $(document).ready(function () {
        $('input#Send').on({
            click: function (e) {
                socket.emit('login', {
                    username: $('#username').val(),
                    password: $('#password').val()
                });
            }
        });
    });
    socket.on('error', function (err) {
        var $myDiv = $('#infos');
        if ($myDiv.length) {
            $('#infos').replaceWith('<h1 id="infos">' + err + '</h1>');
        } else {
            $('#link').append('<h1 id="infos">' + err + '</h1>');
        }
    });
})(jQuery);
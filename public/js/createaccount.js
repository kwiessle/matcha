(function ($) {
    var socket = io.connect('http://localhost:1234');
    $(document).ready(function () {
        $('input#Send').on({
            click: function (e) {
                socket.emit('register', {
                    firstname: $('#firstname').val(),
                    lastname: $('#lastname').val(),
                    username: $('#username').val(),
                    birthday: $('#birthday').val(),
                    password: $('#password').val(),
                    password_verif: $('#password_verif').val(),
                    email: $('#email').val(),
                    email_verif: $('#email_verif').val(),
                    sexe: $('input[name=sexe]:checked').val()
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
    socket.on('success', function (err) {
        var $myDiv = $('#infos');
        if ($myDiv.length) {
            $('#infos').replaceWith('<h1 id="infos">' + err + '</h1>');
        } else {
            $('#link').append('<h1 id="infos">' + err + '</h1>');
        }
    });
    socket.on('empty_fields', function (err) {
        var $myDiv = $('#infos');
        if ($myDiv.length) {
            $('#infos').replaceWith('<h1 id="infos">' + err + '</h1>');
        } else {
            $('#link').append('<h1 id="infos">' + err + '</h1>');
        }
    });
})(jQuery);


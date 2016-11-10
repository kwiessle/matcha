(function ($) {
    var socket = io.connect('http://localhost:1234');
    socket.on('match', function (rows) {
        var match = $('#mustache').html();
        var test = $("#mustache");
        console.log(rows);
        for (var k in rows) {
            console.log(test.length);
            if (rows[k].profil_pic) {
                var result = Mustache.render(match, rows[k]);
                $('#match').append('<div class=" match e1" id="' + k + '">' + result + '</div>');
                $("#" + k).prepend('<img src="' + rows[k].profil_pic + '" alt="user-pic">');
            }
        }
    });
    socket.on('nomatch', function (err) {
        var $myDiv = $('#infos');
        if ($myDiv.lenght) {
            $('#infos').replaceWith('<h1 id="infos">' + err + '</h1>');
        }
        else {
            $('#match').append('<h1 id="infos">' + err + '</h1>');
        }
    });
})(jQuery);
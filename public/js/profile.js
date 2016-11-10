(function ($) {
    var socket = io.connect('http://localhost:1234');
    socket.on('whoami', function (rows) {
        var usr = $('#usr').html();
        var result = Mustache.render(usr, rows);
        $("#usr-info").replaceWith(result);
        $('#usr').prepend('<img id="usr-pic" src="' + rows.profil_pic + '" alt="user photo">');
    });
    socket.on("my_pictures", function (rows) {
        var my_pic = $('#my_pictures').html();
        for (var k in rows) {
            //var result = Mustache.render(my_pic, rows[k]);
            $("#my_pictures").prepend('<img id="pic" class="usr-set-img" src="' + rows[k].pic + '" alt="user-images">')
        }
    });
})(jQuery);
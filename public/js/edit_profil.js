(function ($) {
    var socket = io.connect('http://localhost:1234');
    $(document).ready(function () {
        $('input#Update').on({
            click: function (e) {
                socket.emit('edit', {
                    profil_pic: document.getElementById("photo").src
                    , bio: $('#bio').val()
                    , tags: $('#tags').val()
                    , sexual_or: $('input[name=orientation]:checked').val()
                    , location: $('#location').val()
                });
            }
        });
    });
    socket.on('display_pic', function (rows) {
        var pic = $('#display_pic').html();
        for (var k in rows) {
            $("#display_pic").append('<img  onclick="Changeprofile_pic(this)" id="pics" heigth="250" width="250" src="' + rows[k].pic + '"> </div>');
        }
    });
    socket.on('error', function (err) {
        var $myDiv = $('#infos');
        if ($myDiv.length) {
            $('#infos').replaceWith('<h1 id="infos">' + err + '</h1>');
        }
        else {
            $('#box').append('<h1 id="infos">' + err + '</h1>');
        }
    });
    socket.on('discover', function (err) {
        var $myDiv = $('#infos');
        if ($myDiv.length) {
            $('#infos').replaceWith('<a id="infos" class="link" href="match.html">Discover people around you :)</a>');
        }
        else {
            $('#box').append('<a id="infos" class="link" href="match.html">Discover people around you :)</a>');
        }
    });
})(jQuery);

function previewFile() {
    var preview = document.getElementById('photo');
    var file = document.querySelector('input[type=file]').files[0];
    var reader = new FileReader();
    reader.addEventListener("load", function () {
        preview.src = reader.result;
    }, false);
    if (file) {
        reader.readAsDataURL(file);
        document.getElementById("photo").setAttribute("style", "display:block");
    }
}

function Changeprofile_pic(img) {
    var socket = io.connect('http://localhost:1234');
    socket.emit("changeprofile_pic", {
        picture: img.src
    });
}
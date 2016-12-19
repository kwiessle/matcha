(function ($) {
    $(document).ready(function () {
        var socket = io.connect('https://localhost:4433');
        socket.emit("seen Notification", {});
    })
})(jQuery);
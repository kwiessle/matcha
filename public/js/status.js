(function ($) {
    $(document).ready(function () {
        var elem = document.getElementById('status');
        if (elem.innerHTML != 'online') {
            elem.style.color = "#ff0000";
        }
    })
})(jQuery);
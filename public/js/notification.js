$(document).ready(function () {
    $('input.notification').typeahead({
        name: 'notification',
        remote: 'https://localhost:4433/notification?key=%QUERY',
        limit: 10
    });
});
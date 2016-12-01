$(document).ready(function () {
    $('input.typeahead').typeahead({
        name: 'typeahead',
        remote: 'https://localhost:4433/search?key=%QUERY',
        limit: 10
    });
});
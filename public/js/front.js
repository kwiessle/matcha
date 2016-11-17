document.getElementById('change-email').setAttribute('style', 'display: none');
document.getElementById('change-password').setAttribute('style', 'display: none');

function showEmailChanger() {
    var checker = document.getElementById('change-email').getAttribute("style");
    var checker2 = document.getElementById('change-password').getAttribute("style");

    if (checker2 === 'display: block') {
        showPasswordChanger();
    }
    if (checker === 'display: none') {
        document.getElementById('change-email').setAttribute('style', 'display: block');
    } else {
        document.getElementById('change-email').setAttribute('style', 'display: none');
    }
}

function showPasswordChanger() {
    var checker = document.getElementById('change-password').getAttribute("style");
    var checker2 = document.getElementById('change-email').getAttribute("style");

    if (checker2 === 'display: block') {
        showEmailChanger();
    }
    if (checker === 'display: none') {
        document.getElementById('change-password').setAttribute('style', 'display: block');
    } else {
        document.getElementById('change-password').setAttribute('style', 'display: none');
    }
}
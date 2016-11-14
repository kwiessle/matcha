var mysql = require('mysql');
var connection = mysql.createConnection({
    //port: 8889,
    port: 3307,
    host: 'localhost',
    user: 'root',
    password: 'root',
});

exports.form_checker = function (firstname, lastname, birthday, username, email, conf_email, password, conf_password, sexe) {
    var ret = '';
    var regEmail = new RegExp('^[0-9a-z._-]+@{1}[0-9a-z.-]{2,}[.]{1}[a-z]{2,5}$', 'i');
    var i = 0;
    if (!firstname || !lastname || !birthday || !username || !email || !conf_email || !password || !conf_password || !sexe)
        return ('Please fill all the fields');
    if (email != conf_email)
        return ('Emails doesn\'t match.');
    if (!regEmail.test(email))
        return ('Invalid email format.');
    if (password != conf_password)
        return ('Passwords doesn\'t match.');
    else {
        return ('SQL');
    }
};
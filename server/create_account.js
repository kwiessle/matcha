exports.form_checker = function (firstname, lastname, birthday, username, email, conf_email, password, conf_password, sexe, connection) {
    var ret = '';
    if (!firstname || !lastname || !birthday || !username || !email || !conf_email || !password || !conf_password || !sexe)
        return ('Please fill all the fields');
    else {
        console.log('debut sql');
        connection.connect(function (err) {
            if (err) throw err;
            connection.query("SELECT * FROM users WHERE username =?", [username], function (err, rows) {
                if (rows.length) {
                    return ('Username already registred');
                }
            });
        });
    }
};
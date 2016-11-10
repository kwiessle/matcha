exports.form_checker = function (firstname, lastname, birthday, username, email, conf_email, password, conf_password, sexe) {
    var ret = '';
    if (!firstname)
        return ('Please enter a firstname');
    if (!lastname)
        return ('Please enter a lastname');
    if (!birthday)
        return ('Please enter a birthday');
    if (!username)
        return ('Please enter an username');
    if (!email)
        return ('Please enter an email');
    if (!conf_email)
        return ('Please enter an email confirmation');
    if (!password)
        return ('Please enter a password');
    if (!conf_password)
        return ('Please enter a password confirmation');
    if (!sexe)
        return ('Please select a sexe kind');
    else
        return (1);
};

exports.form_validator = function (username, email, conf_email) {
    connection.query("CREATE DATABASE IF NOT EXISTS matcha;");
}
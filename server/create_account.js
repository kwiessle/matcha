exports.form_checker = function (firstname, lastname, birthday, username, email, conf_email, password, conf_password, sexe) {
    var ret = '';
    var regEmail = new RegExp('^[0-9a-z._-]+@{1}[0-9a-z.-]{2,}[.]{1}[a-z]{2,5}$', 'i');
    var regDate = new RegExp('[0-9]{4}-[0-1][0-9]-[0-3][0-9]', 'i');
    if (!firstname || !lastname || !birthday || !username || !email || !conf_email || !password || !conf_password || !sexe)
        return ('Please fill all the fields');
    if (!regDate.test(birthday))
        return ('Invalid date format')
    var date = birthday.split('-');
    if (date[1] > 12 || date[2] > 31)
        return ('Invalid date format');
    if (date[0] > 1999)
        return ('You are underage')
    if (email != conf_email)
        return ('Emails doesn\'t match');
    if (!regEmail.test(email))
        return ('Invalid email format');
    if (password != conf_password)
        return ('Passwords doesn\'t match');
    if (password.length < 6)
        return ('Password too short');
    else {
        return ('SQL');
    }
};

exports.find_duplicates = function (arr) {
    var len = arr.length,
        out = [],
        counts = {};
    for (var i = 0; i < len; i++) {
        var item = arr[i];
        counts[item] = counts[item] >= 1 ? counts[item] + 1 : 1;
        if (counts[item] === 1) {
            out.push(item);
        }
    }
    return out;
}

exports.cleanArray = function (actual) {
	var newArray = new Array();
	for (var i = 0; i < actual.length; i++) {
		if (actual[i]) {
			newArray.push(actual[i]);
		}
	}
	return newArray;
}
var moment = require('moment');
exports.age = function (date) {
    var now = moment(date, "YYYY-MM-DD").fromNow();
    var birthday = now.split(' ');
    return birthday[0];
}
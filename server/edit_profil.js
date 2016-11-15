
exports.update_profil = function (image, orientation, location, bio, tags, user) {

    console.log('\n\n\n\n' + connection + '\n\n\n\n');
    var ret = '';
    if (orientation) {
        connection.query("UPDATE users SET sexual_or = ? WHERE username = ?", [orientation, user])
        ret = 'Orientation updated';
    }
    return (ret);
};
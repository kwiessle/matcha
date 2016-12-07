/*     D  E  C  L  A  R  A  T  I  O  N  S    */

//ALTER TABLE `block` DEFAULT CHARSET=utf8mb4 COLLATE utf8mb4_bin ROW_FORMAT = COMPACT;



var fs = require('fs');
var https = require('https');
var express = require('express');
var path = require('path');
var options = {
    key: fs.readFileSync('certificates/server-key.pem'),
    cert: fs.readFileSync('certificates/server-crt.pem'),
    ca: fs.readFileSync('certificates/ca-crt.pem'),
};
var app = express();
var mysql = require('mysql');
var connection = mysql.createConnection({
    //port: 8889,
    port: 3307,
    host: 'localhost',
    user: 'root',
    password: 'root'
});
var bodyParser = require('body-parser');
var mustacheExpress = require('mustache-express');
var md5 = require('MD5');
var uniqid = require('uniqid');
var session = require('express-session');
var sess = {
    secret: 'keyboard cat',
    cookie: {},
    resave: false,
    saveUninitialized: false
}

var mailer = require('nodemailer');
var smtpTransport = mailer.createTransport('SMTP', {
    service: 'Gmail',
    auth: {
        user: 'noreply.matcha@gmail.com',
        pass: 'zdpzdpzdp'
    }
});
var multer = require('multer');
var storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, './public/uploads');
    },
    filename: function (req, file, callback) {
        callback(null, req.session.user + '-' + uniqid() + '.png');
    }
});
var upload = multer({
    storage: storage,
    fileFilter: function (req, file, cb) {
        if (file.mimetype !== 'image/png' && file.mimetype !== 'image/jpeg' && file.mimetype !== 'image/jpeg') {
            req.fileValidationError = 'goes wrong on the mimetype';
            return cb(null, false, new Error('goes wrong on the mimetype'));
        }
        cb(null, true);
    }
}).single('userPhoto');
var sharp = require('sharp');
var moment = require('moment');
var create_account = require('./server/create_Account');
var profile = require('./server/age');






/*     S Q L    C  O  N  N  E  X  I  O  N  S    */






connection.connect(function (err) {
    if (err) throw err;
});
connection.query("CREATE DATABASE IF NOT EXISTS matcha;");
connection.query("CREATE TABLE IF NOT EXISTS `matcha`.`users` ( `id` INT(5) NOT NULL AUTO_INCREMENT , `firstname` VARCHAR(255) NOT NULL , `lastname` VARCHAR(255) NOT NULL , `username` VARCHAR(255) NOT NULL , `birthday` DATE NOT NULL , `email` VARCHAR(255) NOT NULL , `password` VARCHAR(255) NOT NULL , `sexe` VARCHAR(8) NOT NULL , `token` VARCHAR(255) NOT NULL , `validation` VARCHAR(1) NOT NULL DEFAULT '0' ,  `profil_pic` LONGTEXT DEFAULT NULL, `sexual_or` VARCHAR(10) NOT NULL DEFAULT 'bi' , `bio` VARCHAR(255) DEFAULT NULL , `location` VARCHAR(255) DEFAULT NULL ,  `pop` INT(5) DEFAULT '0', login VARCHAR(255), `sessionID` VARCHAR(255) DEFAULT NULL, PRIMARY KEY (`id`)) ENGINE = InnoDB;");
connection.query("CREATE TABLE IF NOT EXISTS `matcha`.`pictures` ( `id` INT(5) NOT NULL AUTO_INCREMENT , `pic` LONGTEXT NOT NULL , `username` VARCHAR(255) NOT NULL,  PRIMARY KEY (`id`)) ENGINE = InnoDB;");
connection.query("CREATE TABLE IF NOT EXISTS `matcha`.`history` ( `visitor` VARCHAR(255) NOT NULL , `visited` VARCHAR(255) NOT NULL , `id` INT(5) NOT NULL AUTO_INCREMENT, PRIMARY KEY (`id`)) ENGINE = InnoDB;");
connection.query("CREATE TABLE IF NOT EXISTS `matcha`.`liking` ( `liker` VARCHAR(255) NOT NULL , `liked` VARCHAR(255) NOT NULL , `id` INT(5) NOT NULL AUTO_INCREMENT, PRIMARY KEY (`id`)) ENGINE = InnoDB;");
connection.query("CREATE TABLE IF NOT EXISTS `matcha`.`reports` ( `reporter` VARCHAR(255) NOT NULL , `reported` VARCHAR(255) NOT NULL , `id` INT(5) NOT NULL AUTO_INCREMENT, PRIMARY KEY (`id`)) ENGINE = InnoDB;");
connection.query("CREATE TABLE IF NOT EXISTS `matcha`.`tags` ( `tag` VARCHAR(255) NOT NULL , `username` VARCHAR(255) NOT NULL , `id` INT(5) NOT NULL AUTO_INCREMENT, PRIMARY KEY (`id`)) ENGINE = InnoDB;");
connection.query("CREATE TABLE IF NOT EXISTS `matcha`.`matchs` ( `matcher` VARCHAR(255) NOT NULL , `matched` VARCHAR(255) NOT NULL , `id` INT(5) NOT NULL AUTO_INCREMENT, PRIMARY KEY (`id`)) ENGINE = InnoDB;");
connection.query("CREATE TABLE IF NOT EXISTS `matcha`.`block` ( `id` INT(5) NOT NULL AUTO_INCREMENT , `blocker` VARCHAR(255) NOT NULL , `blocked` VARCHAR(255) NOT NULL , PRIMARY KEY (`id`)) ENGINE = InnoDB;");
connection.query("CREATE TABLE IF NOT EXISTS `matcha`.`dictionary` ( `id` INT(5) NOT NULL AUTO_INCREMENT , `value` VARCHAR(255) NOT NULL , `score` INT(5) NOT NULL , PRIMARY KEY (`id`)) ENGINE = InnoDB;");
connection.query("use matcha");






/*     P  A  G  E  S      R  E  Q  U  E  S  T  S     -     E X P R E S S   -    G  E  T    */







app.engine('html', mustacheExpress());
app.set('view engine', 'html');
app.set('views', __dirname + '/public/html/');
app.use(express.static('public'));
app.use(session(sess));
app.use(bodyParser.urlencoded({
    extended: true
}));

app.get('/', function (req, res) {
    res.render('index.html', {
        message: 'Welcome to Matcha'
    })
});




app.get('/hashtags.html', function (req, res) {
    connection.query("SELECT DISTINCT * FROM dictionary", function (err, rows) {
        if (err) throw err;
        else {
            res.render('hashtags.html', {
                dictionary: {
                    value: rows
                }
            })
        }
    })
})


app.get('/hashtags/:data', function (req, res) {
    if (!req.params.data) {
        res.redirect('/hashtags.html')
    } else {
        connection.query("SELECT DISTINCT * FROM dictionary WHERE substr(value, 1, 1) = ?", [req.params.data], function (err, rows) {
            if (err) throw err;
            else {
                res.render('hashtags.html', {
                    dictionary: {
                        value: rows
                    }
                })
            }
        })
    }
})

app.get('/search', function (req, res) {
    connection.query('SELECT firstname from users where firstname like "%' + req.query.key + '%"', function (err, rows, fields) {
        if (err) throw err;
        var data = [];
        for (i = 0; i < rows.length; i++) {
            data.push(rows[i].firstname);
        }
        res.end(JSON.stringify(data));
    });
});

app.get('/profile.html', function (req, res) {
    if (!req.session.user) {
        res.redirect('/');
    } else {
        connection.query("SELECT * FROM pictures WHERE username = ? AND pic != ?", [req.session.user, req.session.profil_pic], function (err, rows) {
            if (err) throw err;
            else {
                connection.query("SELECT * from tags WHERE username = ?", [req.session.user], function (err, tags) {
                    for (var k in rows) {
                        rows[k].pic = rows[k].pic.replace("uploads/", "");
                    }
                    if (req.session.profil_pic) {
                        res.render('profile.html', {
                            firstname: req.session.firstname,
                            lastname: req.session.lastname,
                            location: req.session.location,
                            bio: req.session.bio,
                            pop: req.session.pop,
                            profil_pic: req.session.profil_pic,
                            birthday: profile.age(req.session.birthday) + ' ans ',
                            display_pictures: {
                                infos: rows
                            },
                            display_tags: {
                                value: tags
                            }
                        })
                    } else {
                        res.render('profile.html', {
                            firstname: req.session.firstname,
                            lastname: req.session.lastname,
                            location: req.session.location,
                            bio: req.session.bio,
                            pop: req.session.pop,
                            profil_pic: 'img/no-pictures.png',
                            display_pictures: {
                                infos: rows
                            }
                        })
                    }
                })
            }
        })
    }
});




app.get('/reset_password.html', function (req, res) {
    res.render('reset_password.html')
})

app.get('/create_account.html', function (req, res) {
    res.render('create_account.html')
});

app.get('/edit_profil.html', function (req, res) {
    if (!req.session.user) {
        res.redirect('/');
    } else {
        res.render('edit_profil.html')
    }
});

app.get('/delete_account.html', function (req, res) {
    if (!req.session.user) {
        res.redirect('/');
    } else {
        res.render('delete_account.html')
    }
})

app.get('/edit_account.html', function (req, res) {
    if (!req.session.user) {
        res.redirect('/');
    } else {
        res.render('edit_account.html', {
            email: req.session.email
        })
    }
})

app.get('/logout.html', function (req, res) {
    connection.query("UPDATE users SET login = ? WHERE username = ?", [new Date().toISOString().slice(0, 10), req.session.user])
    req.session.destroy(function (err) {
        if (err) throw err
        res.redirect('/');
    });
});

app.get('/change_password.html/:token/:username', function (req, res) {
    if (!req.params.token || !req.params.username)
        res.redirect('/');
    else {
        connection.query("SELECT token FROM users WHERE username = ?", [req.params.username], function (err, rows) {
            if (err) throw err;
            if (rows.length && rows[0].token === req.params.token) {
                req.session.guest = req.params.username;
                res.redirect('/change_password.html')
            } else if (req.session.user) {
                res.redirect('/profile.html')
            } else {
                res.redirect('/')
            }
        })
    }
});

app.get('/deletetag/:data', function (req, res) {
    if (req.params.data) {
        connection.query("DELETE FROM tags WHERE tag = ? AND username = ?", [req.params.data, req.session.user], function (err) {
            if (err) throw err;
            else {
                res.redirect('/profile.html')
            }
        })
    } else {
        res.redirect('/profile.html')
    }
})

app.get('/tag/:data', function (req, res) {
    var infos = [];  
    if (req.params.data) {
        connection.query("SELECT username FROM tags WHERE tag =? ", [req.params.data], function (err, rows) {
            if (err) throw err;
            if (rows[0]) {
                for (var k in rows) {
                    (function (k, callback) {
                        connection.query("SELECT * FROM users WHERE username = ?", [rows[k].username], function (err, row) {
                            if (err) throw err;
                            else {
                                infos[k] = row[0];
                                infos[k].birth = profile.age(row[0].birthday);
                                // infos[k].profil_pic = '/' + infos[k].profil_pic;
                                if (!rows[Number(k) + 1]) {
                                    callback();
                                }
                            }
                        });
                    })(k, function () {
                        console.log(infos);
                        res.render("feed.html", {
                            table: {
                                infos: infos
                            }
                        })
                    });
                }
            }
        })
    }
})

app.get('/change_password.html', function (req, res) {
    if (req.session.guest) {
        res.render('change_password.html')
    } else {
        res.redirect('/')
    }
})


app.get('/file', function (req, res) {
    res.redirect('/edit_profil.html');
})

app.get('/updates', function (req, res) {
    res.redirect('/edit_profil.html');
})

app.get('/user.html/:user', function (req, res) {
    if (!req.session.user) {
        res.redirect('/');
    } else {
        if (req.params.user === req.session.user) {
            res.redirect('/profile.html');
        } else {
            connection.query("SELECT * FROM history WHERE visitor = ? AND visited = ?", [req.session.user, req.params.user], function (err, rows) {
                if (err) throw err;
                if (!rows[0]) {
                    connection.query("UPDATE users SET pop = pop + 2 WHERE username = ?", [req.params.user], function (err) {
                        if (err) throw err;
                    });
                    connection.query("INSERT INTO history(visitor, visited) VALUES (?,?)", [req.session.user, req.params.user], function (err) {
                        if (err) throw err;
                    });
                }
            });
            connection.query("SELECT * FROM users WHERE username = ?", [req.params.user], function (err, rows) {
                if (err) throw err;
                if (!rows.length) {
                    res.redirect('/feed.html');
                } else {
                    var infos = rows[0];
                    infos.birth = profile.age(rows[0].birthday);
                    connection.query("SELECT * FROM liking WHERE liker = ? AND liked = ?", [req.session.user, req.params.user], function (err, data) {
                        if (err) throw err;
                        connection.query("SELECT * FROM liking WHERE liker = ? AND liked = ?", [req.session.user, req.params.user], function (err, match) {
                            if (err) throw err;
                            if (match.length) {
                                connection.query("SELECT * FROM pictures WHERE username = ? AND pic != ?", [req.params.user, rows[0].profil_pic], function (err, row) {
                                    if (err) throw err;
                                    for (var k in row) {
                                        row[k].pic = row[k].pic.replace("uploads/", "");
                                    }
                                    if (!infos.profil_pic) {
                                        infos.profil_pic = 'img/no-pictures.png';
                                    }
                                    connection.query("SELECT * FROM tags WHERE username = ?", [req.params.user], function (err, tags) {
                                        if (err) throw err;
                                        connection.query("SELECT * FROM liking WHERE liker = ? AND liked = ?", [req.params.user, req.session.user], function (err, rows) {
                                            if (err) throw err;
                                            var relation = '';
                                            if (rows.length) {
                                                relation = req.params.user + ' you follow';
                                            }
                                            res.render('user.html', {
                                                firstname: infos.firstname,
                                                lastname: infos.lastname,
                                                location: infos.location,
                                                profil_pic: infos.profil_pic,
                                                birthday: infos.birth + ' ans ',
                                                liker: infos.username,
                                                liker_class1: 'dontShow',
                                                relation: relation,
                                                status: infos.login,
                                                pop: infos.pop,
                                                bio: infos.bio,
                                                display_pictures_users: {
                                                    infos: row
                                                },
                                                display_public_tags: {
                                                    value: tags
                                                }
                                            });
                                        })
                                    })
                                });
                            } else {
                                connection.query("SELECT * FROM pictures WHERE username = ? AND pic != ?", [req.params.user, rows[0].profil_pic], function (err, row) {
                                    if (err) throw err;
                                    if (data[0]) {
                                        infos.follow = "you like " + rows[0].firstname;
                                    }
                                    if (match[0]) {
                                        infos.follow = "you match with " + rows[0].firstname;
                                    }
                                    for (var k in row) {
                                        row[k].pic = row[k].pic.replace("uploads/", "");
                                    }
                                    if (!infos.profil_pic) {
                                        infos.profil_pic = 'img/no-pictures.png';
                                    }
                                    connection.query("SELECT * FROM tags WHERE username = ?", [req.params.user], function (err, tags) {
                                        if (err) throw err;
                                        connection.query("SELECT * FROM liking WHERE liker = ? AND liked = ?", [req.params.user, req.session.user], function (err, rows) {
                                            if (err) throw err;
                                            var relation = '';
                                            if (rows.length) {
                                                relation = req.params.user + ' you follow';
                                            }
                                            res.render('user.html', {
                                                firstname: infos.firstname,
                                                lastname: infos.lastname,
                                                location: infos.location,
                                                profil_pic: infos.profil_pic,
                                                birthday: infos.birth + ' ans ',
                                                liker: infos.username,
                                                liker_class2: 'dontShow',
                                                relation: relation,
                                                status: infos.login,
                                                pop: infos.pop,
                                                bio: infos.bio,
                                                display_pictures_users: {
                                                    infos: row
                                                },
                                                display_public_tags: {
                                                    value: tags
                                                }
                                            });
                                        })
                                    })
                                });
                            }
                        });
                    });
                }
            });
        }
    }
})



app.get("/matchs.html", function (req, res) {
    var infos = [];
    if (!req.session.user) {
        res.redirect("/");
    } else {
        connection.query("SELECT * FROM matchs WHERE matcher = ? OR matched = ? ", [req.session.user, req.session.user], function (err, rows) {
            if (err) throw err;
            var matchs = [];
            for (var k in rows) {
                if (rows[k].matcher === req.session.user) {
                    matchs[k] = rows[k].matched;
                } else {
                    matchs[k] = rows[k].matcher;
                }
            }
            if (matchs[0]) {
                for (var k in matchs) {
                    (function (k, callback) {
                        connection.query("SELECT * FROM users WHERE username = ?", [matchs[k]], function (err, row) {
                            if (err) throw err;
                            else {
                                infos[k] = row[0];
                                infos[k].class = (Number(k) % 2) + 1;
                                infos[k].birth = profile.age(row[0].birthday);
                                if (!infos[k].profil_pic)
                                    infos[k].profil_pic = 'img/no-pictures.png';
                                if (!rows[Number(k) + 1]) {
                                    callback();
                                }
                            }
                        });
                    })(k, function () {
                        res.render("matchs.html", {
                            homepage: {
                                infos: infos
                            }
                        })
                    });
                }
            } else {
                res.render("matchs.html", {
                    message: "You don't have match yet"
                })
            }
        })
    }
});

app.get("/followers.html", function (req, res) {
    var infos = [];
    if (!req.session.user) {
        res.redirect("/");
    } else {
        connection.query("SELECT * FROM liking WHERE  liked = ? ", [req.session.user], function (err, rows) {
            if (err) throw err;
            var matchs = [];
            for (var k in rows) {
                matchs[k] = rows[k].liker;
            }
            if (matchs[0]) {
                for (var k in matchs) {
                    (function (k, callback) {
                        connection.query("SELECT * FROM users WHERE username = ?", [matchs[k]], function (err, row) {
                            if (err) throw err;
                            else {
                                infos[k] = row[0];
                                infos[k].class = (Number(k) % 2) + 1;
                                infos[k].birth = profile.age(row[0].birthday);
                                if (!infos[k].profil_pic)
                                    infos[k].profil_pic = 'img/no-pictures.png';
                                if (!rows[Number(k) + 1]) {
                                    callback();
                                }
                            }
                        });
                    })(k, function () {
                        res.render("followers.html", {
                            homepage: {
                                infos: infos
                            }
                        })
                    });
                }
            } else {
                res.render("followers.html", {
                    message: "You don't have followers yet"
                })
            }
        })
    }
});




app.get("/history.html", function (req, res) {
    var infos = [];
    if (!req.session.user) {
        res.redirect("/");
    } else {
        connection.query("SELECT * FROM history WHERE visited =?", [req.session.user], function (err, rows) {
            if (err) throw err;
            if (rows[0]) {
                for (var k in rows) {
                    (function (k, callback) {
                        connection.query("SELECT * FROM users WHERE username = ?", [rows[k].visitor], function (err, row) {
                            if (err) throw err;
                            else {
                                infos[k] = row[0];
                                infos[k].class = (Number(k) % 2) + 1;
                                infos[k].birth = profile.age(row[0].birthday);
                                if (!infos[k].profil_pic)
                                    infos[k].profil_pic = 'img/no-pictures.png';
                                if (!rows[Number(k) + 1]) {
                                    callback();
                                }
                            }
                        });
                    })(k, function () {
                        res.render("history.html", {
                            homepage: {
                                infos: infos
                            }
                        })
                    });
                }
            } else {
                res.render("history.html", {
                    message: "Nobody have visited your profil"
                })
            }
        })
    }
})

app.get('/feed.html', function (req, res) {
    if (!req.session.user) {
        res.redirect("/");
    } else {
        connection.query("SELECT * FROM users WHERE username = ?", [req.session.user], function (err, rows) {
            if (err) throw err;
            if (!rows[0].profil_pic) {
                res.redirect("/error.html");
            } else {
                connection.query("SELECT * FROM users", function (err, rows) {
                    if (err) throw err;
                    else {
                        for (var k in rows) {
                            rows[k].class = (Number(k) % 2) + 1;
                            rows[k].birth = profile.age(rows[k].birthday);
                        }
                        res.render("feed.html", {
                            table: {
                                infos: rows
                            }
                        })
                    }
                })
            }
        })
    }
})

app.get("/blocked.html", function (req, res) {
    var infos = [];
    if (!req.session.user) {
        res.redirect("/");
    } else {
        connection.query("SELECT * FROM block WHERE blocker =?", [req.session.user], function (err, rows) {
            if (err) throw err;
            if (rows[0]) {
                for (var k in rows) {
                    (function (k, callback) {
                        connection.query("SELECT * FROM users WHERE username = ?", [rows[k].blocked], function (err, row) {
                            if (err) throw err;
                            else {
                                infos[k] = row[0];
                                infos[k].class = (Number(k) % 2) + 1;
                                infos[k].birth = profile.age(row[0].birthday);
                                if (!infos[k].profil_pic)
                                    infos[k].profil_pic = 'img/no-pictures.png';
                                if (!rows[Number(k) + 1]) {
                                    callback();
                                }
                            }
                        });
                    })(k, function () {
                        res.render("blocked.html", {
                            blockpage: {
                                infos: infos
                            }
                        })
                    });
                }
            } else {
                res.render("blocked.html", {
                    message: "You don\'t block any user yet"
                })
            }
        })
    }
});


app.get('/unblock/:user', function (req, res) {
    if (!req.params.user) {
        res.redirect('/profile.html')
    } else {
        connection.query("DELETE FROM block WHERE blocker = ? AND blocked = ?", [req.session.user, req.params.user], function (err) {
            if (err) throw err;
            res.redirect('/blocked.html')
        })
    }
})

app.get('/error.html', function (req, res) {
    if (req.session.user) {
        res.render('error.html')
    } else {
        res.redirect('/')
    }

})

app.get('/feed.html', function (req, res) {
    if (req.session.user) {
        if (req.session.profil_pic) {
            res.render('feed.html')
        } else {
            res.redirect('/error.html')
        }
    } else {
        res.redirect('/')
    }
})

app.get("/message.html", function (req, res) {
    var infos = [];
    var infos_tmp = [];
    if (!req.session.user) {
        res.redirect("/");
    } else {
        connection.query("SELECT * FROM matchs WHERE matcher = ? OR matched = ? ", [req.session.user, req.session.user], function (err, rows) {
            if (err) throw err;
            if (rows[0]) {
                for (var k in rows) {
                    (function (k) {
                        if (rows[k].matcher !== req.session.user) infos_tmp[k] = rows[k].matcher;
                        else if (rows[k].matched !== req.session.user) infos_tmp[k] = rows[k].matched;
                    })(k);
                }
                for (var j in infos_tmp) {
                    (function (j, callback) {
                        connection.query("SELECT * FROM users WHERE username = ?", [infos_tmp[j]], function (err, data) {
                            infos[j] = data[0];
                            infos[j].class = (Number(j) % 2) + 1;
                            if (!infos[j].profil_pic) {
                                infos[j].profil_pic = 'img/no-pictures.png';
                            }
                            if (!infos_tmp[Number(j) + 1]) {
                                callback();
                            }
                        })
                    })(j, function () {
                        res.render("message.html", {
                            message: {
                                infos: infos
                            }
                        })
                    });
                }
            } else {
                res.render("message.html", {});
            }
        })
    }
})

app.get("/message.html/:user", function (req, res) {
    var infos = [];
    var infos_tmp = [];
    if (!req.session.user) {
        res.redirect("/");
    } else {
        connection.query("SELECT * FROM matchs WHERE matcher = ? OR matched = ? ", [req.session.user, req.session.user], function (err, rows) {
            if (err) throw err;
            for (var k in rows) {
                (function (k) {
                    if (rows[k].matcher !== req.session.user) infos_tmp[k] = rows[k].matcher;
                    else if (rows[k].matched !== req.session.user) infos_tmp[k] = rows[k].matched;
                })(k);
            }
            for (var j in infos_tmp) {
                (function (j, callback) {
                    connection.query("SELECT * FROM users WHERE username = ?", [infos_tmp[j]], function (err, data) {
                        infos[j] = data[0];
                        if (!infos[j].profil_pic) {
                            infos[j].profil_pic = 'img/no-pictures.png';
                        }
                        infos[j].class = (Number(j) % 2) + 1;
                        if (!infos_tmp[Number(j) + 1]) {
                            callback();
                        }
                    })
                })(j, function () {
                    res.render("message.html", {
                        chatwithme: req.params.user,
                        message: {
                            infos: infos
                        }
                    })
                });
            }
        })
    }
})

/*     P  A  G  E  S      M  A  N  I  P  U  L  A  T  I  O  N  S     -     E X P R E S S   -    P  O  S  T    */







app.post('/', function (req, res) {
    var username = req.body.username;
    var password = md5(req.body.password);
    connection.query("SELECT * FROM users WHERE username = ? AND password = ?", [username, password], function (err, rows) {
        if (err) throw err;
        if (rows.length == 1) {
            req.session.firstname = rows[0].firstname;
            req.session.lastname = rows[0].lastname;
            req.session.user = rows[0].username;
            req.session.birthday = rows[0].birthday;
            req.session.email = rows[0].email;
            req.session.location = rows[0].location;
            req.session.sexe = rows[0].sexe;
            req.session.token = rows[0].token;
            req.session.bio = rows[0].bio;
            req.session.profil_pic = rows[0].profil_pic;
            req.session.pop = rows[0].pop;
            req.session.priority = 0;
            connection.query("UPDATE users SET login = ? WHERE username = ?", ["online", req.session.user])
            res.redirect('profile.html');
        } else {
            res.render('index.html', {
                message: 'Unknown account or invalid password'
            })
        }
    })
})



app.post('/create_account.html', function (req, res) {
    var ret = create_account.form_checker(
        req.body.firstname.trim(),
        req.body.lastname.trim(),
        req.body.birthday.trim(),
        req.body.username.trim(),
        req.body.email.trim(),
        req.body.confirm_email.trim(),
        req.body.password.trim(),
        req.body.confirm_password.trim(),
        req.body.sexe);
    if (ret === 'SQL') {
        connection.query("SELECT * FROM users WHERE username = ?", [req.body.username.trim()], function (err, rows) {
            if (err) throw err;
            if (rows.length) {
                res.render('create_account.html', {
                    'message': 'Account already registred'
                })
            } else {
                connection.query("SELECT * FROM users WHERE email = ?", [req.body.email.trim()], function (err, rows) {
                    if (err) throw err;
                    if (rows.length) {
                        res.render('create_account.html', {
                            'message': 'Email already registred'
                        })
                    } else {
                        connection.query("INSERT INTO users(firstname, lastname, birthday, username, email, sexe, password, token) VALUES (?,?,?,?,?,?,?,?)", [req.body.firstname.trim(), req.body.lastname.trim(), new Date(req.body.birthday.trim()), req.body.username.trim(), req.body.email.trim(), req.body.sexe.trim(), md5(req.body.password.trim()), uniqid()], function (err, rows) {
                            if (err) throw err;
                            res.render('create_account.html', {
                                'message': 'Your account has been created'
                            })
                        })
                    }
                })
            }
        })
    } else {
        res.render('create_account.html', {
            'message': ret
        })
    }
})

app.post('/file', function (req, res) {
    upload(req, res, function (err) {
        var file_upload = '';
        var cropped = 'uploads/' + req.session.user + '-' + uniqid() + '.png';
        if (req.fileValidationError) {
            file_upload = 'Wrong file type : File not uploaded';
        }
        if (req.file) {
            if (err) {
                file_upload = 'A problem occurs : File not uploaded';
            } else {
                sharp(req.file.path).resize(500, 500).toFile('public/' + cropped, function (err) {
                    if (err) {
                        console.log(err);
                    } else {
                        fs.unlinkSync(req.file.path)
                    }
                });
                if (!req.session.profil_pic) {
                    connection.query("UPDATE users SET profil_pic = ? WHERE username = ?", [cropped, req.session.user], function (err) {
                        if (err) throw err;
                    })
                    req.session.profil_pic = cropped;
                }
                connection.query("SELECT * FROM pictures WHERE username = ?", [req.session.user], function queryCB(err, rows) {
                    if (err) throw err;
                    else {
                        if (rows.length < 5) {
                            connection.query("INSERT INTO pictures(pic, username) VALUES(?,?)", [cropped, req.session.user], function (err) {
                                if (err) throw err;
                            })
                            file_upload = 'File uploaded';
                        } else {
                            file_upload = 'You can\'t have more than 5 pictures';
                        }
                        res.render('edit_profil.html', {
                            'orientation': file_upload
                        })
                    }
                })
            }
        } else {
            res.render('edit_profil.html', {
                orientation: 'No file selected or Wrong Type'
            })
        }
    })
})

app.post('/updates', function (req, res) {
    (function (callback) {
        var orientation;
        var location;
        var bio;
        var fname;
        var lname;
        var tag;
        var hashtag = [];
        var results = [];
        if (req.body.firstname) {
            connection.query("UPDATE users SET firstname = ? WHERE username = ?", [req.body.firstname, req.session.user], function (err) {
                if (err) throw err;
            })
            req.session.firstname = req.body.firstname;
            fname = 'First Name Updated';
        }
        if (req.body.lastname) {
            connection.query("UPDATE users SET lastname = ? WHERE username = ?", [req.body.lastname, req.session.user], function (err) {
                if (err) throw err;
            })
            req.session.lastname = req.body.lastname;
            lname = 'Last Name Updated';
        }
        if (req.body.orientation) {
            connection.query("UPDATE users SET sexual_or = ? WHERE username = ?", [req.body.orientation, req.session.user], function (err) {
                if (err) throw err;
            })
            orientation = 'Orientation updated';
        }
        if (req.body.location) {
            connection.query("UPDATE users SET location = ? WHERE username = ?", [req.body.location, req.session.user], function (err) {
                if (err) throw err;
            })
            req.session.location = req.body.location;

            location = 'Location updated';
        }
        if (req.body.bio) {
            connection.query("UPDATE users SET bio = ? WHERE username = ?", [req.body.bio, req.session.user], function (err) {
                if (err) throw err;
            })
            req.session.bio = req.body.bio;

            bio = 'Bio updated';
        }
        if (req.body.preferences) {
            var res = req.body.preferences.trim().split(" ");
            for (var k in res) {
                hashtag[k] = res[k].split("#");
                hashtag[k] = create_account.cleanArray(hashtag[k]);
            }
            var j = 0;
            for (var k in hashtag) {
                for (var i in hashtag[k]) {
                    results[j] = hashtag[k][i];
                    j++
                }
            }
            results = create_account.find_duplicates(results);
            for (var k in results) {
                (function (k) {
                    connection.query("SELECT * FROM tags WHERE tag = ? AND username = ?", [results[k], req.session.user], function (err, rows) {
                        if (err) throw err;
                        if (results[k]) {
                            if (!rows[0]) {
                                connection.query("INSERT INTO tags(tag, username) VALUES(?,?)", [results[k], req.session.user], function (err) {
                                    if (err) throw err;
                                })
                            }
                            connection.query('SELECT * FROM dictionary WHERE value = ?', [results[k]], function (err, row_dic) {
                                if (err) throw err;
                                if (!row_dic[0]) {
                                    console.log(results[k]);
                                    connection.query("INSERT INTO dictionary(value, score) VALUES(?,1)", [results[k]], function (err) {
                                        if (err) throw err;
                                    })
                                }
                                if (row_dic[0]) {
                                    connection.query("UPDATE dictionary SET score = score + 1 WHERE value = ?", [row_dic[0].value], function (err) {
                                        if (err) throw err;
                                    })
                                }
                            })
                        }
                    })
                })(k);
            }
            tag = "Tag updated";
        }
        callback(orientation, location, bio, fname, lname, tag)
    })(function (orientation, location, bio, fname, lname, tag) {
        res.render('edit_profil.html', {
            'orientation': orientation,
            'location': location,
            'bio': bio,
            'firstname': fname,
            'lastname': lname,
            'tag': tag
        })
    });
})

app.post('/edit_account.html', function (req, res) {
    if (req.body.sendEmail) {
        var mail = {
            from: 'noreply.matcha@gmail.com',
            to: req.session.email,
            subject: 'Changing password',
            html: '<p>Hello ' + req.session.firstname + '</p><br><p>To change your password please click on the link below:</p><br><a href="https://localhost:4433/change_password.html/' + req.session.token + '/' + req.session.user + '">Change password</a>'
        }
        smtpTransport.sendMail(mail, function (error, response) {
            if (error) {
                res.render('edit_account.html', {
                    'message': 'A problem occurs : Sending email failed'
                })
            } else {
                res.render('edit_account.html', {
                    'message': 'Email sended'
                })
            }
            smtpTransport.close();
        });
    }
    if (req.body.new_email) {
        var regEmail = new RegExp('^[0-9a-z._-]+@{1}[0-9a-z.-]{2,}[.]{1}[a-z]{2,5}$', 'i');
        if (!regEmail.test(req.body.new_email)) {
            res.render('edit_account.html', {
                message: 'Invalid email format',
                email: req.session.email
            })
        } else {
            connection.query("UPDATE users SET email = ? WHERE username = ?", [req.body.new_email, req.session.user], function (err) {
                if (err) throw err;
            })
            req.session.email = req.body.new_email;
            res.render('edit_account.html', {
                message: 'Email updated',
                email: req.session.email
            })
        }
    }
})


app.post('/delete_account.html', function (req, res) {
    if (req.body.deleteAccount) {
        connection.query("DELETE FROM users WHERE username = ?", [req.session.user], function (err) {
            if (err) throw err;
            else {
                connection.query("DELETE FROM pictures WHERE username = ?", [req.session.user], function (err) {
                    if (err) throw err;
                    else {
                        connection.query("DELETE FROM liking WHERE liker = ? OR liked = ?", [req.session.user, req.session.user], function (err) {
                            if (err) throw err;
                            else {
                                connection.query("DELETE FROM matchs WHERE matcher = ? OR matched = ?", [req.session.user, req.session.user], function (err) {
                                    if (err) throw err;
                                    else {
                                        connection.query("DELETE FROM history WHERE visitor  = ? OR visited = ?", [req.session.user, req.session.user], function (err) {
                                            if (err) throw err;
                                            else {
                                                res.redirect('/logout.html')
                                            }
                                        })
                                    }
                                })
                            }
                        })
                    }
                })
            }
        })
    }
})

app.post('/reset_password.html', function (req, res) {
    if (req.body.sendMail) {
        connection.query("SELECT * FROM users WHERE email = ?", [req.body.sendMail], function (err, rows) {
            if (err) throw err;
            else {
                if (rows.length) {
                    var mail = {
                        from: 'noreply@matcha.com',
                        to: req.body.sendMail,
                        subject: 'Changing password',
                        html: '<p>Hello ' + rows[0].firstname + '</p><br><p>To change your password please click on the link below:</p><br><a href="https://localhost:4433/change_password.html/' + rows[0].token + '/' + rows[0].username + '">Change password</a>'
                    }
                    smtpTransport.sendMail(mail, function (error, response) {
                        if (error) {
                            res.render('reset_password.html', {
                                'message': 'A problem occurs : Sending email failed'
                            })
                        } else {
                            res.render('reset_password.html', {
                                'message': 'Email sended'
                            })
                        }
                        smtpTransport.close();
                    });
                } else {
                    res.render('reset_password.html', {
                        message: 'Email not registred'
                    })
                }
            }
        })
    } else {
        res.render('reset_password.html', {
            message: 'Please type your email'
        })
    }
})


app.post('/change_password.html', function (req, res) {
    var ret = '';
    if (req.body.new && req.body.confirmation) {
        if (req.body.new === req.body.confirmation) {
            connection.query("UPDATE users SET password = ? WHERE username = ?", [md5(req.body.confirmation), req.session.guest], function (err) {
                if (err) throw err;
                else {
                    connection.query("UPDATE users SET token = ? WHERE username = ?", [uniqid(), req.session.guest], function (err) {
                        if (err) throw err;
                    })
                }
            })
            ret = 'Password Updated';
        } else {
            ret = 'Passwords doesn\'t match';
        }
    } else {
        ret = 'Please fill all the fields';
    }
    req.session.guest.destroy;
    res.render('change_password.html', {
        message: ret
    })
})

app.post('/change/:data', function (req, res) {
    if (req.params.data) {
        connection.query("UPDATE users SET profil_pic = ? WHERE username = ?", ["uploads/" + req.params.data, req.session.user], function (err) {
            if (err) throw err;
            else {
                req.session.profil_pic = 'uploads/' + req.params.data;
                res.redirect('/profile.html')
            }
        })
    }
})


app.post('/delete/:data', function (req, res) {
    if (req.params.data) {
        connection.query("DELETE FROM pictures WHERE pic = ?", ['uploads/' + req.params.data], function (err) {
            if (err) throw err;
            else {
                fs.unlinkSync('public/uploads/' + req.params.data);
                res.redirect('/profile.html')
            }
        })
    }
})


app.post('/liker/:user', function (req, res) {
    if (req.params.user) {
        if (req.body.pov === 'follow') {
            connection.query('SELECT username FROM users WHERE username = ?', [req.params.user], function (err, rows) {
                if (err) throw err;
                else {
                    connection.query("SELECT * FROM liking WHERE liker = ? AND liked = ?", [req.session.user, req.params.user], function (err, rows) {
                        if (err) throw err;
                        if (!rows.length) {
                            connection.query("INSERT INTO liking(liker, liked) VALUES(?, ?)", [req.session.user, req.params.user], function (err) {
                                if (err) throw err;
                                else {
                                    connection.query("SELECT * from liking WHERE liker = ? AND liked = ?", [req.params.user, req.session.user], function (err, rows) {
                                        if (rows.length) {
                                            console.log('Param : ' + req.params.user + '    SESSIO? :    ' + req.session.user);
                                            connection.query("INSERT INTO matchs(matcher, matched) VALUES(?,?)", [req.session.user, req.params.user], function (err) {
                                                if (err) throw err;
                                            })
                                        }
                                    })
                                }
                                res.redirect('/user.html/' + req.params.user)
                            })
                        } else {
                            console.log('already liked this fdp');
                            res.redirect('/user.html/' + req.params.user)
                        }
                    })
                }
            })
        }
        if (req.body.pov === 'unfollow') {
            connection.query("DELETE FROM liking WHERE liker = ? AND liked = ?", [req.session.user, req.params.user], function (err, rows) {
                if (err) throw err;
                else {
                    connection.query("DELETE FROM matchs WHERE matcher = ? AND matched = ?", [req.session.user, req.params.user], function (err) {
                        if (err) throw err;
                    })
                    connection.query("DELETE FROM matchs WHERE matcher = ? AND matched = ?", [req.params.user, req.session.user], function (err) {
                        if (err) throw err;
                    })
                    res.redirect('/user.html/' + req.params.user)
                }
            })
        }
    } else {
        res.redirect('/profile.html')
    }
})

app.post('/blocker/:user', function (req, res) {
    if (!req.params.user) {
        res.redirect('/profil.html')
    } else {
        if (req.body.pov === 'Block') {
            connection.query("SELECT username FROM users WHERE username = ?", [req.params.user], function (err, rows) {
                if (rows.length) {
                    connection.query("SELECT * from block WHERE blocker = ? AND blocked = ?", [req.session.user, req.params.user],
                        function (err, rows) {
                            if (!rows.length) {
                                connection.query("INSERT INTO block(blocker, blocked) VALUES(?,?)", [req.session.user, req.params.user], function (err) {
                                    if (err) throw err;
                                    else {
                                        res.redirect('/user.html/' + req.params.user)
                                    }
                                })
                            } else {
                                res.redirect('/user.html/' + req.params.user)
                            }
                        })
                } else {
                    res.redirect('/profile.html')
                }
            })
        }
        if (req.body.pov === 'Report') {
            connection.query("SELECT username FROM users WHERE username = ?", [req.params.user], function (err, rows) {
                if (err) throw err;
                if (rows.length) {
                    connection.query("SELECT * FROM reports WHERE reporter = ? AND reported = ?", [req.session.user, req.params.user], function (err, rows) {
                        if (!rows.length) {
                            connection.query("INSERT INTO reports(reporter, reported) VALUES(?,?)", [req.session.user, req.params.user], function (err) {
                                if (err) throw err;
                                else {
                                    res.redirect('/user.html/' + req.params.user)
                                }
                            })
                        } else {
                            res.redirect('/user.html/' + req.params.user)
                        }
                    })
                } else {
                    res.redirect('/profile.html')
                }
            })
        }
    }
})

app.post('/search', function (req, res) {
    if (req.body.search[0]) {
        connection.query("SELECT username FROM users WHERE firstname = ?", [req.body.search[0]], function (err, rows) {
            if (err) throw err;
            if (rows[0]) {
                console.log(rows[0].username);
                res.redirect('/user.html/' + rows[0].username)
            } else {
                connection.query('SELECT * from users where firstname like "%' + req.body.search[0] + '%"', function (err, rows) {
                    if (err) throw err;
                    for (var k in rows) {
                        rows[k].class = (Number(k) % 2) + 1;
                        rows[k].birth = profile.age(rows[k].birthday);
                    }
                    res.render("feed.html", {
                        table: {
                            infos: rows
                        }
                    })
                })
            }
        })

    } else {
        res.redirect(req.get('referer'));
    }
})



/*     S  E  R  V  E  R     */




https.createServer(options, app, function (req, res) {
    res.writeHead(200);
}).listen(4433);





/*    S  O  C  K  E  T  S     */

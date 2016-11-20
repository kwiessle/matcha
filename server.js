/*     D  E  C  L  A  R  A  T  I  O  N  S    */





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
    port: 8889,
    //port: 3307,
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

var create_account = require('./server/create_Account');







/*     S Q L    C  O  N  N  E  X  I  O  N  S    */






connection.connect(function (err) {
    if (err) throw err;
});
connection.query("CREATE DATABASE IF NOT EXISTS matcha;");
connection.query("CREATE TABLE IF NOT EXISTS `matcha`.`users` ( `id` INT(5) NOT NULL AUTO_INCREMENT , `firstname` VARCHAR(255) NOT NULL , `lastname` VARCHAR(255) NOT NULL , `username` VARCHAR(255) NOT NULL , `birthday` DATE NOT NULL , `email` VARCHAR(255) NOT NULL , `password` VARCHAR(255) NOT NULL , `sexe` VARCHAR(8) NOT NULL , `token` VARCHAR(255) NOT NULL , `validation` VARCHAR(1) NOT NULL DEFAULT '0' ,  `profil_pic` LONGTEXT DEFAULT NULL, `sexual_or` VARCHAR(10) NOT NULL DEFAULT 'bi' , `bio` VARCHAR(255) DEFAULT NULL , `location` VARCHAR(255) DEFAULT NULL , `tags` VARCHAR(255) DEFAULT NULL , `pop` INT(5) DEFAULT '0', login VARCHAR(255), PRIMARY KEY (`id`)) ENGINE = InnoDB;");
connection.query("CREATE TABLE IF NOT EXISTS `matcha`.`pictures` ( `id` INT(5) NOT NULL AUTO_INCREMENT , `pic` LONGTEXT NOT NULL , `username` VARCHAR(255) NOT NULL,  PRIMARY KEY (`id`)) ENGINE = InnoDB;");
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

app.get('/profile.html', function (req, res) {
    if (!req.session.user) {
        res.redirect('/');
    }
    if (req.session.profil_pic) {
        res.render('profile.html', {
            firstname: req.session.firstname,
            lastname: req.session.lastname,
            location: req.session.location,
            bio: req.session.bio,
            profil_pic: req.session.profil_pic
        })
    } else {
        res.render('profile.html', {
            firstname: req.session.firstname,
            lastname: req.session.lastname,
            location: req.session.location,
            bio: req.session.bio,
            profil_pic: 'img/no-pictures.png'
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
    connection.query("UPDATE users SET login = ? WHERE username = ?", ["offline", req.session.user])
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

app.get('/change_password.html', function (req, res) {
    if (req.session.guest) {
        res.render('change_password.html')
    } else {
        res.redirect('/')
    }
})






/*     P  A  G  E  S      M  A  N  I  P  U  L  A  T  I  O  N  S     -     E X P R E S S   -    P  O  S  T    */







app.post('/', function (req, res) {
    connection.query("SELECT * FROM users WHERE username = ? AND password = ?", [req.body.username, md5(req.body.password)], function (err, rows) {
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
            req.session.profil_pic = rows[0].profil_pic;
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
        req.body.firstname,
        req.body.lastname,
        req.body.birthday,
        req.body.username,
        req.body.email,
        req.body.confirm_email,
        req.body.password,
        req.body.confirm_password,
        req.body.sexe);
    console.log(req.body.birthday);
    if (ret === 'SQL') {
        connection.query("SELECT * FROM users WHERE username = ?", [req.body.username], function (err, rows) {
            if (err) throw err;
            if (rows.length) {
                res.render('create_account.html', {
                    'message': 'Account already registred'
                })
            } else {
                connection.query("SELECT * FROM users WHERE email = ?", [req.body.email], function (err, rows) {
                    if (err) throw err;
                    if (rows.length) {
                        res.render('create_account.html', {
                            'message': 'Email already registred'
                        })
                    } else {
                        connection.query("INSERT INTO users(firstname, lastname, birthday, username, email, sexe, password, token) VALUES (?,?,?,?,?,?,?,?)", [req.body.firstname, req.body.lastname, new Date(req.body.birthday), req.body.username, req.body.email, req.body.sexe, md5(req.body.password), uniqid()], function (err, rows) {
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


app.post('/edit_profil.html', function (req, res) {
    upload(req, res, function (err) {
        var file_upload = '';
        var orientation = '';
        var location = '';
        var bio = '';
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
                        fs.unlink(req.file.path)
                    }
                });
                if (!req.session.profil_pic) {
                    connection.query("UPDATE users SET profil_pic = ? WHERE username = ?", [cropped, req.session.user], function (err) {
                        if (err) throw err;
                    })
                    req.session.profil_pic = cropped;
                }
                (function (callback) {
                    connection.query("SELECT * FROM pictures WHERE username = ?", [req.session.user], function (err, rows) {
                        if (err) throw err;
                        else
                            callback(rows.length);
                    })
                })(function (length) {
                    console.log(length);
                    if (length == 5) {
                        req.session.priority = 1;
                    }
                    console.log(req.session.priority);
                    if (length < 5) {
                        connection.query("INSERT INTO pictures(pic, username) VALUES(?,?)", [cropped, req.session.user], function (err) {
                            if (err) throw err;
                        })
                    }
                })
                file_upload = 'File uploaded';
            }
        }
        if (req.body.orientation) {
            connection.query("UPDATE users SET sexual_or = ? WHERE username = ?", [req.body.orientatation, req.session.user], function (err) {
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
        console.log(req.session.priority);
        if (req.session.priority == 0) {
            res.render('edit_profil.html', {
                'orientation': orientation,
                'location': location,
                'bio': bio,
                'upload': file_upload
            })
        } else {
            res.render('edit_profil.html', {
                'orientation': 'You can\'t have more than 5 pictures.'
            })
        }
        req.session.priority = 0;
    })
});

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
                        res.redirect('/logout.html')
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



/*     S  E  R  V  E  R     */





https.createServer(options, app, function (req, res) {
    res.writeHead(200);
}).listen(4433);
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
    } else {
        res.render('profile.html', {
            firstname: req.session.firstname,
            lastname: req.session.lastname
        })
    }
});

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

app.get('/change_password.html', function (req, res) {
    res.render('change_password.html')
});






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
            req.session.sexe = rows[0].sexe;
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
    console.log(req.body.orientation);
})

app.post('/edit_account.html', function (req, res) {
    var mailOptions = {
        from: 'no-reply@matcha.com',
        to: req.session.email,
        subject: 'Change password',
        text: 'Hello ' + req.session.firstname + ', \n to change your password please click on the link below :',
        html: '<a href="https://localhost:4433/">' + '</a>'
    };
    if (req.body.sendEmail) {
        var mail = {
            from: 'noreply.matcha@gmail.com',
            to: req.session.email,
            subject: 'Changing password',
            html: '<p>Hello ' + req.session.user + '</p><br><p>Ton change your password please click on the link below:</p><br><a href="https://localhost:4433/">Change password</a>'
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



/*     S  E  R  V  E  R     */





https.createServer(options, app, function (req, res) {
    res.writeHead(200);
}).listen(4433);
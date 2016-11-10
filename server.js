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
var create_account = require('./server/create_Account');






/*     S Q L    C  O  N  N  E  X  I  O  N  S    */






connection.connect(function (err) {
    if (err) throw err;
});
connection.query("CREATE DATABASE IF NOT EXISTS matcha;");
connection.query("CREATE TABLE IF NOT EXISTS `matcha`.`users` ( `id` INT(5) NOT NULL AUTO_INCREMENT , `firstname` VARCHAR(255) NOT NULL , `lastname` VARCHAR(255) NOT NULL , `username` VARCHAR(255) NOT NULL , `birthday` DATE NOT NULL , `email` VARCHAR(255) NOT NULL , `password` VARCHAR(255) NOT NULL , `sexe` VARCHAR(8) NOT NULL , `token` VARCHAR(255) NOT NULL , `validation` VARCHAR(1) NOT NULL DEFAULT '0' ,  `profil_pic` LONGTEXT DEFAULT NULL, `sexual_or` VARCHAR(10) NOT NULL DEFAULT 'bi' , `bio` VARCHAR(255) DEFAULT NULL , `location` VARCHAR(255) DEFAULT NULL , `tags` VARCHAR(255) DEFAULT NULL , `pop` INT(5) DEFAULT '0', login VARCHAR(255), PRIMARY KEY (`id`)) ENGINE = InnoDB;");
connection.query("CREATE TABLE IF NOT EXISTS `matcha`.`pictures` ( `id` INT(5) NOT NULL AUTO_INCREMENT , `pic` LONGTEXT NOT NULL , `username` VARCHAR(255) NOT NULL,  PRIMARY KEY (`id`)) ENGINE = InnoDB;");
connection.query("use matcha");






/*     P  A  G  E  S      R  E  Q  U  E  S  T  S     -     E X P R E S S     */







app.engine('html', mustacheExpress());
app.set('view engine', 'html');
app.set('views', __dirname + '/public/html/');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({
    extended: true
}));

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname + '/public/html/index.html'));
});

app.post('/', function (req, res) {
    var user = req.body.username;
    var password = req.body.password;
})

app.get('/create_account.html', function (req, res) {
    res.sendFile(path.join(__dirname + '/public/html/create_account.html'));
});

app.post('/create_account.html', function (req, res) {
    var firstname = req.body.firstname;
    var lastname = req.body.lastname;
    var birthday = req.body.birthday;
    var username = req.body.username;
    var email = req.body.email;
    var conf_email = req.body.confirm_email;
    var password = req.body.password;
    var conf_password = req.body.confirm_password;
    var sexe = req.body.sexe;
    var ret = create_account.form_checker(firstname, lastname, birthday, username, email, conf_email, password, conf_password, sexe);
    console.log(ret);
    res.render('create_account.html', {
        'message': ret
    })
});






/*     S  E  R  V  E  R     */





https.createServer(options, app, function (req, res) {
    res.writeHead(200);
}).listen(4433);
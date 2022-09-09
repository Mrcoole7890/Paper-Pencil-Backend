var mysql = require('mysql');
var express = require('express');
var app = express();
const cors = require('cors');
const dotenv = require('dotenv');



dotenv.config();
app.use(cors());
app.use(express.json());


var con = mysql.createConnection({
    host: process.env.Host,
    user: process.env.User,
    password: process.env.Password,
    database: process.env.Database
});

con.query("CREATE TABLE IF NOT EXISTS users( userid int NOT NULL AUTO_INCREMENT, username VARCHAR(50) NOT NULL, password VARCHAR(256), PRIMARY KEY(userid) );");

app.post('/login', function(req, res) {
    con.query("SELECT * FROM users WHERE username = ? and password = ?", [req.body.userName, req.body.password], function(err, res, fields) {
        if (res.length == 0) con.query("INSERT INTO users (username, password) VALUES ( ? , ? )", [req.body.userName, req.body.password], function(err, res){
            if (err) return err;
            console.log("Added user ( " + req.body.userName + " ) to table.");
        });
        else {
            console.log("User Found ( "+ res[0].username +" )");
        }
    });
});


app.listen(8081);
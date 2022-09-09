var mysql = require('mysql');
var express = require('express');
var app = express();
const cors = require('cors');

var con;
var Host = "";
var User = "";
var Password = "";
var Database = "";

app.use(cors());
app.use(express.json());

process.argv.forEach(function (val, index, array) {

    switch(index) {
        case 2: 
            Host = val;
            break;
        case 3: 
            User = val;
            break;
        case 4:
            Password = val;
            break;
        case 5:
            Database = val;
    }

    con = mysql.createConnection({
        host: Host,
        user: User,
        password: Password,
        database: Database
      });

    

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
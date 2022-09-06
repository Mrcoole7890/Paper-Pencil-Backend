var mysql = require('mysql');
var express = require('express');
var app = express();

var con;
var Host = "";
var User = "";
var Password = "";
var Database = "";

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

app.get('/login', function(req, err) {
    if (err) throw err;
    console.log(req.body.userName);
    console.log(req.body.password);
});


con.connect(function(err) {
    if (err) throw err;
    console.log("Connected");
});
var mysql = require('mysql');
var express = require('express');
var app = express();
const cors = require('cors');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');

let parseToken = function(req, res){
    let tokenHeaderKey = process.env.JWT_HEADER_SEC_KEY;
    let jwtSecretKey = process.env.JWT_SECRET_KEY;
  
    try {
        const token = req.header(tokenHeaderKey);
        console.log(token)
        const verified = jwt.verify(token, jwtSecretKey);
        if(verified){
            return verified;
        }else{
            return {'status':403};
        }
    } catch (error) {
        return {'status':403};
    }
}

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
con.query("CREATE TABLE IF NOT EXISTS base( baseid int NOT NULL AUTO_INCREMENT, playerid int NOT NULL,"
          + " FOREIGN KEY (playerid) REFERENCES users(userid) ON DELETE CASCADE, PRIMARY KEY(baseid)  );");
con.query("CREATE TABLE IF NOT EXISTS clan( clanid int NOT NULL AUTO_INCREMENT, playerid int NOT NULL,"
          + " clanname varchar(100) NOT NULL,"
          + " FOREIGN KEY (playerid) REFERENCES users(userid) ON DELETE CASCADE, PRIMARY KEY(clanid)  );");

app.post('/login', function(req, responce) {
    con.query("SELECT * FROM users WHERE username = ? and password = ?", [req.body.userName, req.body.password], function(err, res, fields) {
        if (res.length == 0) {
            if (err) return err;
            responce.send({status : "UNotF"})
            console.log("User Not Found!");
        }
        else {
            responce.send({status : "Good", token: generateToken(JSON.stringify(res[0]))})
            console.log("User Found ( "+ res[0].username +" )");
        }
    });
});

app.post('/register', function(req, responce) {
    con.query("SELECT * FROM users WHERE username = ?", [req.body.userName, req.body.password], function(err, res, fields) {
        if (res.length == 0) con.query("INSERT INTO users (username, password) VALUES ( ? , ? )", [req.body.userName, req.body.password], function(err, res){
            if (err) return err;
            responce.send({status : "Accepted"});
            console.log("Added user ( " + req.body.userName + " ) to table.");
        });
        else {
            responce.send({status : "USInUse"})
            console.log("User Found ( "+ res[0].username +" )");
        }
    });
});

app.post("/user", (req, res) => {
    let data = parseToken(req,res);
    res.send(data);
});

function generateToken(obj) {
    let jwtSecretKey = process.env.JWT_SECRET_KEY;
    const token = jwt.sign(obj, jwtSecretKey);
    return token;
}




app.listen(8081);



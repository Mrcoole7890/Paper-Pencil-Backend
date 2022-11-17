var mysql = require('mysql');
var express = require('express');
var app = express();
const cors = require('cors');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');


dotenv.config();
app.use(cors());
app.use(express.json());


var con = mysql.createConnection({
    host: process.env.Host,
    user: process.env.User,
    password: process.env.Password,
    database: process.env.Database
});

con.query("CREATE TABLE IF NOT EXISTS users("
    + "userid int NOT NULL AUTO_INCREMENT,"
    + "username VARCHAR(50) NOT NULL,"
    + "password VARCHAR(256),"
    + "PRIMARY KEY(userid));");

con.query("CREATE TABLE IF NOT EXISTS base("
    + "baseid int NOT NULL AUTO_INCREMENT,"
    + "playerid int NOT NULL,"
    + "size int NOT NULL,"
    + "location varchar(10),"
    + "FOREIGN KEY (playerid) REFERENCES users(userid),"
    + "PRIMARY KEY(baseid));");

con.query("CREATE TABLE IF NOT EXISTS clan("
    + "clanid int NOT NULL AUTO_INCREMENT,"
    + "playerid int NOT NULL,"
    + "clanname varchar(100) NOT NULL,"
    + "FOREIGN KEY (playerid) REFERENCES users(userid),"
    + "PRIMARY KEY(clanid));");

con.query("CREATE TABLE IF NOT EXISTS member("
    + "memberid int NOT NULL AUTO_INCREMENT,"
    + "playerid int NOT NULL,"
    + "membername VARCHAR(50) NOT NULL,"
    + "health int NOT NULL,"
    + "quality int NOT NULL,"
    + "FOREIGN KEY (playerid) REFERENCES users(userid),"
    + "PRIMARY KEY(memberid));");

app.post('/login', function(req, responce) {

    getUser(req.body.userName).then((dbResults) => {
        console.log(dbResults);
        if (dbResults.length == 0) {
            if (err) return err;
            responce.send({status : "UNotF"})
            console.log("User Not Found!");
        }
        else {
            responce.send({status : "Good", token: generateToken(JSON.stringify(dbResults[0]))})
            console.log("User Found ( "+ dbResults[0].userid +" )");
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

app.get("/clan", (req,res) =>{
    let data = parseToken(req,res);
    console.log(data);
});

let parseToken = function(req, res){
    let tokenHeaderKey = process.env.JWT_HEADER_SEC_KEY;
    let jwtSecretKey = process.env.JWT_SECRET_KEY;
  
    try {
        const token = req.header(tokenHeaderKey);
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

function generateToken(obj) {
    let jwtSecretKey = process.env.JWT_SECRET_KEY;
    const token = jwt.sign(obj, jwtSecretKey);
    return token;
}

function generateMockData() {
    addPlayer("TestMan", "TestPass");
    addBase(1, 2, "1,9");
    addClan(1, "xXSwagClanXx");
    addMember(1, "Juicer", 2);
}

function addPlayer(username, password) {
    con.query("INSERT INTO users (username, password) VALUES ( ? , ? )", [username, password], function(err, res){
        if (err) return err;
        console.log("Added user ( " + username + " ) to table.");
    });
}

function addBase(userid, size, location) {
    con.query("INSERT INTO base (playerid, size, location) VALUES ( ?, ?, ? )", [userid, size, location], function(err, res){
        if (err) return err;
        console.log("Added base to table.");
    });
}

function addClan(userid, clanName) {
    con.query("INSERT INTO clan (playerid, clanname) VALUES ( ?, ? )", [userid, clanName], function(err, res){
        if (err) return err;
        console.log("Added clan to table.");
    });
}

function addMember(userid, name, quality) {
    con.query("INSERT INTO member (playerid, membername, quality, health) VALUES ( ?, ?, ?, 100 )", [userid, name, quality], function(err, res){
        if (err) return err;
        console.log("Added member to table.");
    });
}

function getClan(userid) {
    return new Promise((resolve, reject) => {
        var queryStr = 
        "Select clanname " + 
        "from clan " +
        "Where playerid = ?";

        var queryVar = [userid];

        con.query(queryStr, queryVar, function(err, rows, fields){
            if (err) reject(err);
            else {
                resolve(rows);
            }
        });
    });
}

function getMembers(playerid) {
    return new Promise((resolve, reject) => {
        var queryStr = 
        "Select membername " + 
        "from member " +
        "Where playerid = ?";

        var queryVar = [playerid];

        con.query(queryStr, queryVar, function(err, rows, fields){
            if (err) reject(err);
            else {
                resolve(rows);
            }
        });
    });  
}

function getUser(username) {
    return new Promise((resolve, reject) => {
        var queryStr = 
        "Select userid, username " + 
        "from users " +
        "Where username = ?";

        var queryVar = [username];

        con.query(queryStr, queryVar, function(err, rows, fields){
            if (err) reject(err);
            else {
                resolve(rows);
            }
        });
    });  
}

generateMockData();
app.listen(8081);
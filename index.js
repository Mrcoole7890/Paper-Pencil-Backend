var mysql = require('mysql');
var express = require('express');
var app = express();
const cors = require('cors');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const userModel = require("./models/user-model.js");
const userService = require("./services/user-service.js");

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
    let user = new userModel.user(null, req.body.username, req.body.password);
    userService.getUserByUsernamePassword(user, con).then((dbResults) => {
        if (dbResults == null) {
            responce.send({status : "UNotF"});
            console.log("User Not Found!");
        }
        else {
            responce.send({status : "Good", token: generateToken(JSON.stringify(dbResults))});
            console.log("User Found ( "+ dbResults.username +" )");
        }
    });

});

app.post('/register', function(req, responce) {
  let us = new userModel.user(null, req.body.username, req.body.password);
  if (!userService.isUserNameTaken(us, con)) {
    userService.addUser(us, con);
    responce.send({status : "Good"});
  }
  else responce.send({status : "USInUse"});
});

app.post("/user", (req, res) => {
    let data = parseToken(req,res);
    userService.getUser(data.username, con).then(dbResults => {
      us = new userModel.user(dbResults.userid, dbResults.username, null);
      console.log(us);
      res.send({status:"Good", username: us.username});
    });

});

app.post("/clan", (req,res) =>{
  let data = parseToken(req,res);
  getClan(data.userid).then((dbResults) => {
      console.log(dbResults);
      if (dbResults.length == 0) {
          res.send({status : "UNotF"})
          console.log("User Not Found!");
      }
      else {
          res.send({status : "Good", clanName : dbResults[0].clanname});
          console.log("Clan Found ( "+ dbResults[0] +" )");
      }
  });
});

app.post("/base", (req,res) =>{
  let data = parseToken(req,res);
  getBase(data.userid).then((dbResults) => {
      console.log(dbResults);
      if (dbResults.length == 0) {
          res.send({status : "UNotF"})
          console.log("Base Not Found!");
      }
      else {
          res.send({status : "Good", size : dbResults[0].size, location: dbResults[0].location});
          console.log("Base Found ( "+ dbResults[0] +" )");
      }
  });
});

app.post("/memebers", (req,res) =>{
  let data = parseToken(req,res);
  getMembers(data.userid).then((dbResults) => {
      console.log(dbResults);
      if (dbResults.length == 0) {
          res.send({status : "UNotF"})
          console.log("Memebers Not Found!");
      }
      else {
          res.send({status : "Good", memebers: dbResults});
          dbResults.forEach((item, i) => {
            console.log("Memebers Found ( "+ item.membername +" )");
          });


      }
  });
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
    addPlayer("TestMan1", "TestPass");
    addPlayer("TestMan2", "TestPass");
    addPlayer("TestMan3", "TestPass");
    addPlayer("TestMan4", "TestPass");

    addBase(1, 2, "1,9");
    addBase(2, 1, "1,9");
    addBase(3, 3, "1,9");
    addBase(4, 4, "1,9");

    addClan(1, "xXSwagClanXx");
    addClan(2, "$Lay3rs");
    addClan(3, "OneHunna");
    addClan(4, "GameOver");

    addMember(1, "Juicer", 2);
    addMember(2, "Looter", 2);
    addMember(3, "Shooter", 2);
    addMember(2, "Miner", 2);
    addMember(3, "Grinder", 2);
    addMember(1, "Builder", 2);
    addMember(4, "Cole", 2);
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
        "Select membername, health, quality " +
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

function getBase(playerid) {
    return new Promise((resolve, reject) => {
        var queryStr =
        "Select * " +
        "from base " +
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

//generateMockData();
app.listen(8081);

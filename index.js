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

app.post("/user/generateToken", (req, res) => {
  
    console.log("Request recived!")
    let jwtSecretKey = process.env.JWT_SECRET_KEY;
    let data = {
        time: Date(),
        userId: 12,
    }
  
    const token = jwt.sign(data, jwtSecretKey);
  
    res.send( {generatedToken : token} );
});

app.get("/user/validateToken", (req, res) => {
    // Tokens are generally passed in the header of the request
    // Due to security reasons.
  
    let tokenHeaderKey = process.env.JWT_HEADER_SEC_KEY;
    let jwtSecretKey = process.env.JWT_SECRET_KEY;
  
    try {
        const token = req.header(tokenHeaderKey);
        const verified = jwt.verify(token, jwtSecretKey);
        if(verified){
            return res.send({ "message" : "Successfully Verified" });
        }else{
            // Access Denied
            return res.status(401).send(error);
        }
    } catch (error) {
        // Access Denied
        return res.status(401).send(error);
    }
});


app.listen(8081);
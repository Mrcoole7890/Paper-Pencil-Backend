const userModel = require("../models/user-model.js");

function addUser(user, connection) {
    connection.query("INSERT INTO users (username, password) VALUES ( ? , ? )",
     [user.username, user.password], function(err, res){
        if (err) return err;
        console.log("Added user ( " + user.username + " ) to table.");
    });
}

function isUserNameTaken(user, connection) {
  console.log(user.username);
  connection.query("SELECT * FROM users WHERE username = ?", [user.username], function(err, res, fields) {
    return res.length == 0;
  });
}

function getUser(username, connection) {
    return new Promise((resolve, reject) => {
        var queryStr =
        "Select userid, username " +
        "from users " +
        "Where username = ?";

        var queryVar = [username];

        connection.query(queryStr, queryVar, function(err, rows, fields){
            if (err) reject(err);
            else {
                user = new userModel.user(rows[0].userid, rows[0].username, null);
                resolve(user);
            }
        });
    });
}

function getUserByUsernamePassword(user, connection) {
  return new Promise((resolve, reject) => {
      var queryStr =
      "Select userid, username " +
      "from users " +
      "Where username = ?" +
      "and password = ?";

      var queryVar = [user.username, user.password];

      connection.query(queryStr, queryVar, function(err, rows, fields){
          if (err) reject(err);
          else {
              if (rows.length == 0) {
                resolve(null);
              }
              else {
                console.log(rows);
                user = new userModel.user(rows[0].userid, rows[0].username, null);
                resolve(user);
              }
          }
      });
  });
}

module.exports = { addUser, getUser, isUserNameTaken, getUserByUsernamePassword };

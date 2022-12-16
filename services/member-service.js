function addMember(member) {
    con.query("INSERT INTO member (playerid, membername, quality, health) VALUES ( ?, ?, ?, 100 )",
    [member.userid, member.membername, member.quality], function(err, res){
        if (err) return err;
        console.log("Added member to table.");
    });
}

function getMembers(playerid, connection) {
    return new Promise((resolve, reject) => {
        var queryStr =
        "Select membername, health, quality " +
        "from member " +
        "Where playerid = ?";

        var queryVar = [playerid];

        connection.query(queryStr, queryVar, function(err, rows, fields){
            if (err) reject(err);
            else {
                resolve(rows);
            }
        });
    });
}

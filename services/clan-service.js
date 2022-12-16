function addClan(clan) {
    con.query("INSERT INTO clan (playerid, clanname) VALUES ( ?, ? )",
    [clan.playerid, clan.clanname], function(err, res){
        if (err) return err;
        console.log("Added clan to table.");
    });
}

function getClan(userid, connection) {
    return new Promise((resolve, reject) => {
        var queryStr =
        "Select clanname " +
        "from clan " +
        "Where playerid = ?";

        var queryVar = [userid];

        connection.query(queryStr, queryVar, function(err, rows, fields){
            if (err) reject(err);
            else {
                resolve(rows);
            }
        });
    });
}

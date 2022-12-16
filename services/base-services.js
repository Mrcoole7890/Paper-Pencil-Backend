function addBase(base) {
    con.query("INSERT INTO base (playerid, size, location) VALUES ( ?, ?, ? )",
    [base.playerid, base.size, base.location], function(err, res){
        if (err) return err;
        console.log("Added base to table.");
    });
}

function getBase(playerid, connection) {
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

import { DB } from "./connect.js"; // If you export {DB}
import express from "express";
// import DB from "./connect.js"; // if you export default DB

const app = express();

app.use(express.json()); // No need to download body-parser package and use it as middleware "app.use(bodyParser.json())"

app.get("/", (req, res) => {
    res.status(200);
    res.send("Mortal enemy service is online.");
});

app.get("/api", (req, res) => {
    //get all enemies from the table
    res.set("content-type", "application/json");
    const sql = "SELECT * FROM enemies";
    let data = { enemies: [] };
    try {
        // DB.get() // for a single row
        DB.all(sql, [], (err, rows) => {
            if (err) {
                throw err; //let the catch handle it
            }
            rows.forEach((row) => {
                data.enemies.push({
                    id: row.enemy_id,
                    name: row.enemy_name,
                    reason: row.enemy_reason,
                });
            });
            let content = JSON.stringify(data);
            res.send(content);
        });
    } catch (err) {
        console.log(err.message);
        res.status(467);
        res.send(`{"code":467, "status":"${err.message}"}`);
    }
});

app.post("/api", (req, res) => {
    console.log(req.body);

    res.set("content-type", "application/json");
    const sql = "INSERT INTO enemies(enemy_name, enemy_reason) VALUES (? , ?)"; //id auto increment
    let newId;
    try {
        DB.run(sql, [req.body.name, req.body.reason], function (err) {
            if (err) throw err;
            newId = this.lastID; //provides the auto increment integer enemy_id
            res.status(201);
            let data = { status: 201, message: `Mortal enemy ${newId} saved.` };
            let content = JSON.stringify(data);
            res.send(content);
        });
    } catch (err) {
        console.log(err.message);
        res.status(468);
        res.send(`{"code":468, "status":"${err.message}"}`);
    }
});

app.delete("/api", (req, res) => {
    res.set("content-type", "application/json");
    const sql = "DELETE FROM enemies WHERE enemy_id=?";
    try {
        DB.run(sql, [req.query.id], function (err) {
            if (err) throw err;
            if (this.changes === 1) {
                //one item deleted
                res.status(200);
                res.send(
                    `{"message":"Enemy ${req.query.id} was removed from list."}`
                );
            } else {
                //no delete done
                res.status(200);
                res.send(`{"message":"No operation needed."}`);
            }
        });
    } catch (err) {
        console.log(err.message);
        res.status(468);
        res.send(`{"code":468, "status":"${err.message}"}`);
    }
});

app.listen(5000, (err) => {
    if (err) return console.log(err.message);
    console.log(`Listening on port 5000`);
});

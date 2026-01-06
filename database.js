const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./minibus.db');

db.serialize(() => {
    // Users table
    db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    last_name TEXT,
    phone TEXT UNIQUE,
    is_driver BOOLEAN,
    car_number TEXT,
    route_name TEXT
  )`);

    // Stops table
    db.run(`CREATE TABLE IF NOT EXISTS stops (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    order_index INTEGER,
    lat REAL,
    lon REAL,
    route_id INTEGER
  )`);

    // Passenger choices table
    db.run(`CREATE TABLE IF NOT EXISTS passenger_choices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    passenger_phone TEXT,
    stop_id INTEGER,
    destination_name TEXT,
    lat REAL,
    lon REAL
  )`);

    // Seed stops if empty
    db.get("SELECT count(*) as count FROM stops", (err, row) => {
        if (row.count === 0) {
            console.log("Seeding stops...");
            const stmt = db.prepare("INSERT INTO stops (name, order_index, lat, lon, route_id) VALUES (?, ?, ?, ?, ?)");

            // Route 14
            stmt.run("Paysik", 1, 41.311081, 69.240562, 14);
            stmt.run("Bazaar Parking", 2, 41.321081, 69.250562, 14);
            stmt.run("Train Station", 3, 41.331081, 69.260562, 14);

            // Route 77
            stmt.run("Saransha", 1, 41.2995, 69.2401, 77);
            stmt.run("Airport", 2, 41.3095, 69.2501, 77);

            // Route 23
            stmt.run("Tunnel", 1, 41.3500, 69.2000, 23);
            stmt.run("Military Office", 2, 41.3600, 69.2100, 23);

            stmt.finalize();
        }
    });
});

module.exports = db;

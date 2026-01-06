const express = require('express');
const cors = require('cors');
const db = require('../../../Desktop/driiver/backend/database');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.json({ message: "Minibus API is running!" });
});

// Register User (Driver or Passenger)
app.post('/register', (req, res) => {
    const { name, last_name, phone, is_driver, car_number, route_name } = req.body;
    if (!phone) return res.status(400).json({ error: "Phone number is required" });

    db.get("SELECT * FROM users WHERE phone = ?", [phone], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (row) {
            return res.json(row);
        }

        db.run(
            "INSERT INTO users (name, last_name, phone, is_driver, car_number, route_name) VALUES (?, ?, ?, ?, ?, ?)",
            [name, last_name, phone, is_driver, car_number, route_name],
            function (err) {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ id: this.lastID, name, last_name, phone, is_driver, car_number, route_name });
            }
        );
    });
});

// Get Route Stops
app.get('/route/:id', (req, res) => {
    const routeId = req.params.id;
    db.all("SELECT * FROM stops WHERE route_id = ? ORDER BY order_index", [routeId], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Passenger Select Location (Stop or Custom)
app.post('/select-stop', (req, res) => {
    const { passenger_phone, stop_id, destination_name, lat, lon } = req.body;

    db.run(
        "INSERT INTO passenger_choices (passenger_phone, stop_id, destination_name, lat, lon) VALUES (?, ?, ?, ?, ?)",
        [passenger_phone, stop_id, destination_name, lat, lon],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ id: this.lastID, passenger_phone, stop_id, destination_name, lat, lon });
        }
    );
});

// Driver Get All Passenger Choices for their route
app.get('/driver-choices/:routeId', (req, res) => {
    const routeId = req.params.routeId;
    // Join with users to get the passenger's actual name
    const sql = `
    SELECT u.name, u.last_name, pc.destination_name, COALESCE(s.lat, pc.lat) as lat, COALESCE(s.lon, pc.lon) as lon, s.name as stop_label
    FROM passenger_choices pc
    LEFT JOIN stops s ON pc.stop_id = s.id
    LEFT JOIN users u ON pc.passenger_phone = u.phone
    WHERE (s.route_id = ? OR pc.lat IS NOT NULL)
  `;
    db.all(sql, [routeId], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});

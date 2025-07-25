const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Basis-Route VOR dem static middleware definieren
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'start.html'));
});

// Static middleware nach der Basis-Route
app.use(express.static(path.join(__dirname, 'public')));

// API-Route als Beispiel
app.get('/api/status', (req, res) => {
    res.json({ status: 'online', message: 'Server läuft!' });
});

// Server starten
app.listen(PORT, () => {
    console.log(`Server läuft auf Port ${PORT}`);
}); 
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const inputCheck = require('./utils/inputCheck');

const PORT = process.env.PORT || 3001;
const app = express();

// Express Middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Connect to database
const db = new sqlite3.Database('./db/election.db', err => {
  if (err) {
    return console.error(err.message);
  }
  console.log('Connected to election database');
});

// ROUTES
// HTML ROUTES
app.get('/', (req, res) => {
  res.json({ message: 'Hello World' });
});

// API ROUTES
// GET all rows from candidates table
app.get('/api/candidates', (req, res) => {
  const sql = `SELECT * FROM candidates`;
  const params = [];
  db.all(sql, params, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({
      message: 'success',
      data: rows
    });
  });
});

// GET a single candidate
app.get('/api/candidates/:id', (req, res) => {
  const { id } = req.params;
  const sql = `SELECT * FROM candidates WHERE id = ?`;
  const params = [id];
  db.get(sql, params, (err, row) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({ 
      message: 'success',
      data: row 
    });
  });
});

// DELETE a candidate
app.delete('/api/candidates/:id', (req, res) => {
  const sql = `DELETE FROM candidates WHERE id = ?`;
  const params = [req.params.id];
  db.run(sql, params, function(err, result) {
    if (err) {
      res.status(400).json({ error: res.message });
      return;
    }
    res.json({
      message: 'successfully deleted',
      changes: this.changes
    });
  });
});

// CREATE a candidate
app.post('/api/candidates', ({ body }, res) => {
  const errors = inputCheck(body, 'first_name', 'last_name', 'industry_connected');
  if (errors) {
    res.status(400).json({ error: errors });
    return;
  }
  const sql = `
    INSERT INTO candidates 
      (first_name, last_name, industry_connected)
      VALUES(?,?,?)`;
  const params = [body.first_name, body.last_name, body.industry_connected];
  db.run(sql, params, function(err, result) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({
      message: 'success',
      data: body,
      id: this.lastID
    });
  });
});

// LAST ROUTE - Default response for any request Not Found (Catch All)
app.use((req, res) => {
  res.status(404).end();
});

// Start server after DB connection
db.on('open',  () => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
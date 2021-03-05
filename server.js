const express = require('express');
const db = require('./db/database');

const PORT = process.env.PORT || 3001;
const app = express();

const apiRoutes = require('./routes/apiRoutes');

// Express Middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// ROUTES
// Api Routes
app.use('/api', apiRoutes);

// Html Routes
app.get('/', (req, res) => {
  res.json({ message: 'Hello World' });
});

// Else Route (Not Found) - Default response for any request Not Found (Catch All)
app.use((req, res) => {
  res.status(404).end();
});

// Start server after DB connection
db.on('open',  () => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
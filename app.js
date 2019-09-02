// Requirements
const express = require ('express');
const mongoose = require ('mongoose');
const bodyParser = require ('body-parser');

// Variables initialization
const app = express ();

// Body Parser
app.use (bodyParser.urlencoded ({extended: false}));
app.use (bodyParser.json ());

// Routes imports
const appRoutes = require ('./routes/app');
const usuarioRoutes = require ('./routes/usuario');
const loginRoutes = require ('./routes/login');

// Database Connection
mongoose.connection.openUri (
  'mongodb://localhost:27017/hospitalDB',
  (err, res) => {
    if (err) throw err;

    console.log ('Database: \x1b[36m%s\x1b[0m', 'connected');
  }
);

// Routes
app.use ('/usuario', usuarioRoutes);
app.use ('/login', loginRoutes);
app.use ('/', appRoutes);

// Listening
app.listen (3000, () =>
  console.log ('Express server: \x1b[36m%s\x1b[0m', 'connected')
);

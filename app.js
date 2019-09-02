// Requirements
const express = require ('express');
const mongoose = require ('mongoose');

// Variables initialization
const app = express ();

// Database Connection
mongoose.connection.openUri (
  'mongodb://localhost:27017/hospitalDB',
  (err, res) => {
    if (err) throw err;

    console.log ('Database: \x1b[36m%s\x1b[0m', 'connected');
  }
);

// Routes
app.get ('/', (req, res, next) => {
  res.status (200).json ({
    ok: true,
    mensaje: 'Petición realizada correctamente',
  });
});

// Listening
app.listen (3000, () =>
  console.log ('Express server: \x1b[36m%s\x1b[0m', 'connected')
);

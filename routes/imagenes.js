const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();

app.get('/:tipo/:img', (req, res, next) => {
  const {tipo, img} = req.params;

  const pathImagen = path.resolve(__dirname, `../uploads/${tipo}/${img}`);

  if (fs.existsSync(pathImagen)) {
    res.sendFile(pathImagen);
  } else {
    const pathNoImage = path.resolve(__dirname, '../assets/no-img.jpg');
    res.sendFile(pathNoImage);
  }
});

module.exports = app;

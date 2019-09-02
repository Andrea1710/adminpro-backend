const express = require('express');
const app = express();

const Hospital = require('../models/hospital');
const Medico = require('../models/medico');
const Usuario = require('../models/usuario');

// ==========================================
// Busqueda por Collection
// ==========================================
app.get('/colleccion/:tabla/:busqueda', (req, res, next) => {
  const {busqueda} = req.params;
  const {tabla} = req.params;
  const regex = new RegExp(busqueda, 'i');

  let promesa;

  switch (tabla) {
    case 'usuarios':
      promesa = buscarUsuarios(busqueda, regex);
      break;
    case 'medicos':
      promesa = buscarMedicos(busqueda, regex);
      break;
    case 'hospitales':
      promesa = buscarHospitales(busqueda, regex);
      break;
    default:
      return res.status(400).json({
        ok: false,
        mensaje:
          'Los tipos de busquedas solo son: usuarios, medicos, hospitales',
        error: {message: 'Tipo de tabla/colleccion no valido'},
      });
  }

  promesa.then(data => {
    res.status(200).json({
      ok: true,
      [tabla]: data,
    });
  });
});

// ==========================================
// Busqueda general
// ==========================================
app.get('/todo/:busqueda', (req, res, next) => {
  const {busqueda} = req.params;
  const regex = new RegExp(busqueda, 'i');

  Promise.all([
    buscarHospitales(busqueda, regex),
    buscarMedicos(busqueda, regex),
    buscarUsuarios(busqueda, regex),
  ]).then(respuestas => {
    res.status(200).json({
      ok: true,
      hospitales: respuestas[0],
      medicos: respuestas[1],
      usuarios: respuestas[2],
    });
  });
});

const buscarHospitales = (busqueda, regex) => {
  return new Promise((resolve, reject) => {
    Hospital.find({nombre: regex})
      .populate('usuario', 'nombre email')
      .exec((err, hospitales) => {
        if (err) reject('Error al cargar hospitales', err);
        else resolve(hospitales);
      });
  });
};

const buscarMedicos = (busqueda, regex) => {
  return new Promise((resolve, reject) => {
    Medico.find({nombre: regex})
      .populate('usuario', 'nombre email')
      .populate('hospital')
      .exec((err, medicos) => {
        if (err) reject('Error al cargar hospitales', err);
        else resolve(medicos);
      });
  });
};

const buscarUsuarios = (busqueda, regex) => {
  return new Promise((resolve, reject) => {
    Usuario.find({}, 'nombre email role')
      .or([{nombre: regex}, {email: regex}])
      .exec((err, usuarios) => {
        if (err) reject('Error al cargar usuarios', err);
        else resolve(usuarios);
      });
  });
};

module.exports = app;

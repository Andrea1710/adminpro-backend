const express = require('express');
const app = express();

const mdAutentication = require('../middlewares/autentication');

const Hospital = require('../models/hospital');

// Obtener todos los Hospitales
app.get('/', (req, res, next) => {
  var desde = req.query.desde || 0;
  desde = Number(desde);
  Hospital.find({})
    .skip(desde)
    .limit(5)
    .populate('usuario', 'nombre email')
    .exec((err, hospitales) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: 'Error cargando hospitales',
          errors: err,
        });
      }

      Hospital.count({}, (err, count) => {
        res.status(200).json({
          ok: true,
          hospitales: hospitales,
          total: count,
        });
      });
    });
});

//Actualizar Hospital
app.put('/:id', mdAutentication.verificaToken, (req, res, next) => {
  const {id} = req.params;
  const {nombre} = req.body;

  Hospital.findById(id, (err, hospital) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al buscar hospital',
        errors: err,
      });
    }

    if (!hospital) {
      return res.status(400).json({
        ok: false,
        mensaje: `El hospital con el id ${id} no existe`,
        errors: {message: 'No existe un hospital con ese ID'},
      });
    }

    hospital.nombre = nombre;
    hospital.usuario = req.usuario._id;

    hospital.save((err, hospitalGuardado) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          mensaje: 'Error al actualizar hospital',
          errors: err,
        });
      }

      res.status(200).json({
        ok: true,
        hospital: hospitalGuardado,
      });
    });
  });
});

// Crear un nuevo Hospital
app.post('/', mdAutentication.verificaToken, (req, res, next) => {
  const {nombre} = req.body;

  const hospital = new Hospital({
    nombre: nombre,
    usuario: req.usuario._id,
  });

  hospital.save((err, hospitalGuardado) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Error al crear hospital',
        errors: err,
      });
    }

    res.status(201).json({
      ok: true,
      hospital: hospitalGuardado,
    });
  });
});

// Borrar un Hospital por el ID
app.delete('/:id', mdAutentication.verificaToken, (req, res, next) => {
  const {id} = req.params;

  Hospital.findByIdAndRemove(id, (err, hospitalBorrado) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Error al borrar Hospital',
        errors: err,
      });
    }

    if (!hospitalBorrado) {
      return res.status(400).json({
        ok: false,
        mensaje: 'No existe un hospital con ese ID',
        errors: {message: 'No existe un hospital con ese ID'},
      });
    }

    res.status(200).json({
      ok: true,
      hospital: hospitalBorrado,
    });
  });
});

module.exports = app;

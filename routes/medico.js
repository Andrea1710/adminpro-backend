const express = require('express');
const app = express();

const mdAutentication = require('../middlewares/autentication');

const Medico = require('../models/medico');

// Obtener todos los Medicos
app.get('/', (req, res, next) => {
  var desde = req.query.desde || 0;
  desde = Number(desde);

  Medico.find({})
    .skip(desde)
    .limit(5)
    .populate('usuario', 'nombre email')
    .populate('hospital')
    .exec((err, medicos) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: 'Error cargando medicos',
          errors: err,
        });
      }

      Medico.count({}, (err, count) => {
        res.status(200).json({
          ok: true,
          medicos: medicos,
          total: count,
        });
      });
    });
});

// Obtener Medico
app.get('/:id', (req, res, next) => {
  const {id} = req.params;

  Medico.findById(id)
    .populate('usuario', 'nombre email img')
    .populate('hospital')
    .exec((err, medico) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: 'Error al buscar medico',
          errors: err,
        });
      }

      if (!medico) {
        return res.status(400).json({
          ok: false,
          mensaje: `El medico con el id ${id} no existe`,
          errors: {message: 'No existe un medico con ese ID'},
        });
      }
      res.status(200).json({
        ok: true,
        medico: medico,
      });
    });
});

//Actualizar Medico
app.put('/:id', mdAutentication.verificaToken, (req, res, next) => {
  const {id} = req.params;
  const {nombre, hospital} = req.body;

  Medico.findById(id, (err, medico) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al buscar medico',
        errors: err,
      });
    }

    if (!medico) {
      return res.status(400).json({
        ok: false,
        mensaje: `El medico con el id ${id} no existe`,
        errors: {message: 'No existe un medico con ese ID'},
      });
    }

    medico.nombre = nombre;
    medico.usuario = req.usuario._id;
    medico.hospital = hospital;

    medico.save((err, medicoGuardado) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          mensaje: 'Error al actualizar medico',
          errors: err,
        });
      }

      res.status(200).json({
        ok: true,
        medico: medicoGuardado,
      });
    });
  });
});

// Crear un nuevo Medico
app.post('/', mdAutentication.verificaToken, (req, res, next) => {
  const {nombre, hospital} = req.body;

  const medico = new Medico({
    nombre: nombre,
    usuario: req.usuario._id,
    hospital: hospital,
  });

  medico.save((err, medicoGuardado) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Error al crear medico',
        errors: err,
      });
    }

    res.status(201).json({
      ok: true,
      medico: medicoGuardado,
    });
  });
});

// Borrar un Hospital por el ID
app.delete('/:id', mdAutentication.verificaToken, (req, res, next) => {
  const {id} = req.params;

  Medico.findByIdAndRemove(id, (err, medicoBorrado) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Error al borrar medico',
        errors: err,
      });
    }

    if (!medicoBorrado) {
      return res.status(400).json({
        ok: false,
        mensaje: 'No existe un medico con ese ID',
        errors: {message: 'No existe un medico con ese ID'},
      });
    }

    res.status(200).json({
      ok: true,
      medico: medicoBorrado,
    });
  });
});

module.exports = app;

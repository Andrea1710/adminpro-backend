const express = require ('express');
const bcrypt = require ('bcryptjs');
const jwt = require ('jsonwebtoken');
const app = express ();

const SEED = require ('../config/config').SEED;

const Usuario = require ('../models/usuario');

app.post ('/', (req, res, next) => {
  const {email, password} = req.body;

  Usuario.findOne ({email: email}, (err, usuarioDB) => {
    if (err) {
      return res.status (500).json ({
        ok: false,
        mensaje: 'Error al buscar usuario',
        errors: err,
      });
    }

    if (!usuarioDB) {
      return res.status (400).json ({
        ok: false,
        mensaje: 'Credenciales incorrectas - email',
        errors: err,
      });
    }

    if (!bcrypt.compareSync (password, usuarioDB.password)) {
      return res.status (400).json ({
        ok: false,
        mensaje: 'Credenciales incorrectas - password',
        errors: err,
      });
    }

    // Crear un token
    usuarioDB.password = ':)';
    const token = jwt.sign ({usuario: usuarioDB}, SEED, {
      expiresIn: 14400,
    });

    res.status (200).json ({
      ok: true,
      usuario: usuarioDB,
      token: token,
      id: usuarioDB._id,
    });
  });
});

module.exports = app;

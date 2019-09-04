const express = require('express');
const bcrypt = require('bcryptjs');
const app = express();

const {
  verificaToken,
  verificaAdminRole,
  verificaAdminUsuario,
} = require('../middlewares/autentication');

const Usuario = require('../models/usuario');

// Obtener todos los Usuarios
app.get('/', (req, res, next) => {
  var desde = req.query.desde || 0;
  desde = Number(desde);

  Usuario.find({}, 'nombre email img role google')
    .skip(desde)
    .limit(5)
    .exec((err, usuarios) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: 'Error cargando usuarios',
          errors: err,
        });
      }

      Usuario.count({}, (err, count) => {
        res.status(200).json({
          ok: true,
          usuarios: usuarios,
          total: count,
        });
      });
    });
});

//Actualizar Usuario
app.put('/:id', [verificaToken, verificaAdminUsuario], (req, res, next) => {
  const {id} = req.params;
  const {nombre, email, role} = req.body;

  Usuario.findById(id, (err, usuario) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al buscar usuario',
        errors: err,
      });
    }

    if (!usuario) {
      return res.status(400).json({
        ok: false,
        mensaje: `El usuario con el id ${id} no existe`,
        errors: {message: 'No existe un usuario con ese ID'},
      });
    }

    usuario.nombre = nombre;
    usuario.email = email;
    usuario.role = role;

    usuario.save((err, usuarioGuardado) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          mensaje: 'Error al actualizar usuario',
          errors: err,
        });
      }

      usuarioGuardado.password = ':)';

      res.status(200).json({
        ok: true,
        usuario: usuarioGuardado,
      });
    });
  });
});

// Crear un nuevo Usuario
app.post('/', (req, res, next) => {
  const {nombre, email, password, img, role} = req.body;

  const encryptedPassword = bcrypt.hashSync(password, 10);

  const usuario = new Usuario({
    nombre: nombre,
    email: email,
    password: encryptedPassword,
    img: img,
    role: role,
  });

  usuario.save((err, usuarioGuardado) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Error al crear Usuario',
        errors: err,
      });
    }

    res.status(201).json({
      ok: true,
      usuario: usuarioGuardado,
      usuarioToken: req.usuario,
    });
  });
});

// Borrar un Usuario por el ID
app.delete('/:id', [verificaToken, verificaAdminRole], (req, res, next) => {
  const {id} = req.params;

  Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Error al borrar Usuario',
        errors: err,
      });
    }

    if (!usuarioBorrado) {
      return res.status(400).json({
        ok: false,
        mensaje: 'No existe un usuario con ese ID',
        errors: {message: 'No existe un usuario con ese ID'},
      });
    }

    res.status(200).json({
      ok: true,
      usuario: usuarioBorrado,
    });
  });
});

module.exports = app;

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const app = express();

const {verificaToken} = require('../middlewares/autentication');

const SEED = require('../config/config').SEED;

const Usuario = require('../models/usuario');

// Google
const CLIENT_ID = require('../config/config').CLIENT_ID;
const {OAuth2Client} = require('google-auth-library');
const client = new OAuth2Client(CLIENT_ID);

// ==========================================
// Renovar el Token
// ==========================================
app.get('/renuevatoken', verificaToken, (req, res, next) => {
  const {usuario} = req;
  const token = jwt.sign({usuario: usuario}, SEED, {
    expiresIn: 14400,
  });

  res.status(200).json({
    ok: true,
    token: token,
  });
});

// ==========================================
// Autenticación de Google
// ==========================================
async function verify(token) {
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: CLIENT_ID,
  });
  const payload = ticket.getPayload();

  return {
    nombre: payload.name,
    email: payload.email,
    img: payload.picture,
    google: true,
  };
}

app.post('/google', async (req, res, next) => {
  const {token} = req.body;
  const googleUser = await verify(token).catch(e => {
    res.status(403).json({
      ok: false,
      mensaje: 'Token no es valido',
    });
  });

  Usuario.findOne({email: googleUser.email}, (err, usuarioDB) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al buscar usuario',
        errors: err,
      });
    }

    if (usuarioDB) {
      if (usuarioDB.google === false) {
        return res.status(400).json({
          ok: false,
          mensaje: 'Debe de usar su autencicación normal',
        });
      } else {
        const token = jwt.sign({usuario: usuarioDB}, SEED, {
          expiresIn: 14400,
        });

        res.status(200).json({
          ok: true,
          usuario: usuarioDB,
          token: token,
          id: usuarioDB._id,
          menu: obtenerMenu(usuarioDB.role),
        });
      }
    } else {
      // El Usuario no existe, hay que crearlo
      const usuario = new Usuario();

      usuario.nombre = googleUser.nombre;
      usuario.email = googleUser.email;
      usuario.img = googleUser.img;
      usuario.google = true;
      usuario.password = ':)';

      usuario.save((err, usuarioDB) => {
        const token = jwt.sign({usuario: usuarioDB}, SEED, {
          expiresIn: 14400,
        });

        res.status(200).json({
          ok: true,
          usuario: usuarioDB,
          token: token,
          id: usuarioDB._id,
          menu: obtenerMenu(usuarioDB.role),
        });
      });
    }
  });
});

// ==========================================
// Autenticación normal
// ==========================================

app.post('/', (req, res, next) => {
  const {email, password} = req.body;

  Usuario.findOne({email: email}, (err, usuarioDB) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al buscar usuario',
        errors: err,
      });
    }

    if (!usuarioDB) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Credenciales incorrectas - email',
        errors: err,
      });
    }

    if (!bcrypt.compareSync(password, usuarioDB.password)) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Credenciales incorrectas - password',
        errors: err,
      });
    }

    // Crear un token
    usuarioDB.password = ':)';
    const token = jwt.sign({usuario: usuarioDB}, SEED, {
      expiresIn: 14400,
    });

    res.status(200).json({
      ok: true,
      usuario: usuarioDB,
      token: token,
      id: usuarioDB._id,
      menu: obtenerMenu(usuarioDB.role),
    });
  });
});

const obtenerMenu = role => {
  const menu = [
    {
      titulo: 'Principal',
      icono: 'mdi mdi-gauge',
      submenu: [
        {titulo: 'Dashboard', url: '/dashboard'},
        {titulo: 'ProgressBar', url: '/progress'},
        {titulo: 'Gráficas', url: '/graficas1'},
        {titulo: 'Promesas', url: '/promesas'},
        {titulo: 'Rxjs', url: '/rxjs'},
      ],
    },
    {
      titulo: 'Mantenimientos',
      icono: 'mdi mdi-folder-lock-open',
      submenu: [
        {titulo: 'Hospitales', url: '/hospitales'},
        {titulo: 'Médicos', url: '/medicos'},
      ],
    },
  ];

  if (role === 'ADMIN_ROLE')
    menu[1].submenu.unshift({titulo: 'Usuarios', url: '/usuarios'});

  return menu;
};

module.exports = app;

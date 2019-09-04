const jwt = require('jsonwebtoken');

const SEED = require('../config/config').SEED;

// ==========================================
// Verificar Token
// ==========================================
exports.verificaToken = (req, res, next) => {
  const {token} = req.query;

  jwt.verify(token, SEED, (err, decoded) => {
    if (err) {
      return res.status(401).json({
        ok: false,
        mensaje: 'token incorrecto',
        errors: err,
      });
    }

    req.usuario = decoded.usuario;

    next();
  });
};

// ==========================================
// Verificar Admin
// ==========================================
exports.verificaAdminRole = (req, res, next) => {
  const {usuario} = req;

  if (usuario.role === 'ADMIN_ROLE') {
    next();
    return;
  } else {
    return res.status(401).json({
      ok: false,
      mensaje: 'Token incorrecto - No es Administrador',
      errors: {message: 'No es administrador'},
    });
  }
};

// ==========================================
// Verificar Admin o Mismo Usuario
// ==========================================
exports.verificaAdminUsuario = (req, res, next) => {
  const {usuario} = req;
  const {id} = req.params;

  if (usuario.role === 'ADMIN_ROLE' || usuario._id === id) {
    next();
    return;
  } else {
    return res.status(401).json({
      ok: false,
      mensaje: 'Token incorrecto - No es Administrador ni es el mismo Usuario',
      errors: {message: 'No es administrador'},
    });
  }
};

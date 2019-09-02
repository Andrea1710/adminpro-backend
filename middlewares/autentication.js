const jwt = require ('jsonwebtoken');

const SEED = require ('../config/config').SEED;

exports.verificaToken = (req, res, next) => {
  const {token} = req.query;

  jwt.verify (token, SEED, (err, decoded) => {
    if (err) {
      return res.status (401).json ({
        ok: false,
        mensaje: 'token incorrecto',
        errors: err,
      });
    }

    req.usuario = decoded.usuario;

    next ();
  });
};

const express = require('express');
const fs = require('fs');
const app = express();
const fileUpload = require('express-fileupload');

const Usuario = require('../models/usuario');
const Medico = require('../models/medico');
const Hospital = require('../models/hospital');

// default options
app.use(fileUpload());

app.put('/:tipo/:id', (req, res, next) => {
  const {tipo, id} = req.params;

  // Tipos de colleccion
  const tiposValidos = ['hospitales', 'medicos', 'usuarios'];

  if (tiposValidos.indexOf(tipo) < 0) {
    return res.status(400).json({
      ok: false,
      mensaje: 'El Tipo de colleccion no es valido',
      errors: {message: 'El Tipo de colleccion no es valido'},
    });
  }

  if (!req.files) {
    return res.status(500).json({
      ok: false,
      mensaje: 'No ha seleccionado nada',
      errors: {message: 'Debe de seleccionar una imagen'},
    });
  }

  // Obtener nombre del archivo
  const archivo = req.files.imagen;
  const nombreCortado = archivo.name.split('.');
  const extensionArchivo = nombreCortado[nombreCortado.length - 1];

  // Aceptamos solo estas extensiones
  const extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];

  if (extensionesValidas.indexOf(extensionArchivo) < 0) {
    return res.status(500).json({
      ok: false,
      mensaje: 'Extensión no valida',
      errors: {
        message: 'Las extensiones validas son' + extensionesValidas.join(', '),
      },
    });
  }

  // Nombre de archivo personalizado
  const nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extensionArchivo}`;

  // Mover el archivo del temporal a un Path
  const path = `./uploads/${tipo}/${nombreArchivo}`;

  archivo.mv(path, err => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al mover archivo',
        errors: err,
      });
    }

    subirPorTipo(tipo, id, nombreArchivo, res);
  });
});

const subirPorTipo = (tipo, id, nombreArchivo, res) => {
  if (tipo === 'usuarios') {
    Usuario.findById(id, (err, usuario) => {
      if (!usuario) {
        return res.status(400).json({
          ok: true,
          mensaje: 'Usuario no existe',
          errors: {message: 'Usuario no existe'},
        });
      }

      const pathViejo = './uploads/usuarios/' + usuario.img;

      // Si existe, elimina la imagen anterior
      if (fs.existsSync(pathViejo)) {
        fs.unlink(pathViejo, err => {
          if (err) {
            return res.status(500).json({
              ok: false,
              mensaje: 'Error al eliminar imagen anterior',
              path: pathViejo,
            });
          }
        });
      }

      usuario.img = nombreArchivo;

      usuario.save((err, usuarioActualizado) => {
        usuarioActualizado.password = ':)';

        return res.status(200).json({
          ok: true,
          mensaje: 'Image de Usuario actualizada',
          usuarioActualizado: usuarioActualizado,
        });
      });
    });
  }

  if (tipo === 'medicos') {
    Medico.findById(id, (err, medico) => {
      if (!medico) {
        return res.status(400).json({
          ok: true,
          mensaje: 'Medico no existe',
          errors: {message: 'Medico no existe'},
        });
      }
      const pathViejo = './uploads/medicos/' + medico.img;

      // Si existe, elimina la imagen anterior
      if (fs.existsSync(pathViejo)) {
        fs.unlink(pathViejo, err => {
          if (err) {
            return res.status(500).json({
              ok: false,
              mensaje: 'Error al eliminar imagen anterior',
              path: pathViejo,
            });
          }
        });
      }

      medico.img = nombreArchivo;

      medico.save((err, medicoActualizado) => {
        return res.status(200).json({
          ok: true,
          mensaje: 'Image de Medico actualizada',
          medico: medicoActualizado,
        });
      });
    });
  }

  if (tipo === 'hospitales') {
    Hospital.findById(id, (err, hospital) => {
      if (!hospital) {
        return res.status(400).json({
          ok: true,
          mensaje: 'Hospital no existe',
          errors: {message: 'Hospital no existe'},
        });
      }

      const pathViejo = './uploads/hospitales/' + hospital.img;

      // Si existe, elimina la imagen anterior
      if (fs.existsSync(pathViejo)) {
        fs.unlink(pathViejo, err => {
          if (err) {
            return res.status(500).json({
              ok: false,
              mensaje: 'Error al eliminar imagen anterior',
              path: pathViejo,
            });
          }
        });
      }

      hospital.img = nombreArchivo;

      hospital.save((err, hospitalActualizado) => {
        return res.status(200).json({
          ok: true,
          mensaje: 'Image de hospital actualizada',
          hospital: hospitalActualizado,
        });
      });
    });
  }
};

module.exports = app;

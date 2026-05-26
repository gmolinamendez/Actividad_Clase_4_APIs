const express = require('express');
const router = express.Router();
const {
  listarMedicos,
  listarMedicosDisponibles,
  obtenerMedicoPorId,
  crearMedico,
  actualizarMedico,
  eliminarMedico
} = require('../Controllers/medicosController');

router.get('/medicos/disponibles', listarMedicosDisponibles);
router.get('/medicos', listarMedicos);
router.get('/medicos/:id', obtenerMedicoPorId);
router.post('/medicos', crearMedico);
router.put('/medicos/:id', actualizarMedico);
router.delete('/medicos/:id', eliminarMedico);

module.exports = router;

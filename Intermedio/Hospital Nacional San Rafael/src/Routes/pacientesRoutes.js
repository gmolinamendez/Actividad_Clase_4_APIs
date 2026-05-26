const express = require('express');
const router = express.Router();
const verificarAccesoExpediente = require('../middleware/verificarAccesoExpediente');
const {
  listarPacientes,
  buscarPacientes,
  obtenerPacientePorId,
  crearPaciente,
  actualizarPaciente,
  eliminarPaciente,
  agregarEntradaExpediente,
  obtenerHistorialClinico
} = require('../Controllers/pacientesController');

router.get('/pacientes/buscar', buscarPacientes);
router.get('/pacientes', listarPacientes);
router.get('/pacientes/:id', obtenerPacientePorId);
router.post('/pacientes', crearPaciente);
router.put('/pacientes/:id', actualizarPaciente);
router.delete('/pacientes/:id', eliminarPaciente);

router.get(
  '/pacientes/:pacienteId/expediente/historial',
  verificarAccesoExpediente,
  obtenerHistorialClinico
);
router.post(
  '/pacientes/:pacienteId/expediente',
  verificarAccesoExpediente,
  agregarEntradaExpediente
);

module.exports = router;

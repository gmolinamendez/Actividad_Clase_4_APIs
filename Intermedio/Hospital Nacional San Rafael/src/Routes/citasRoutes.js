const express = require('express');
const router = express.Router();
const {
  obtenerCitaPorId,
  agendarCita,
  cambiarEstadoCita,
  citasDelDiaPorDepartamento
} = require('../Controllers/citasController');

router.get('/citas/del-dia/por-departamento', citasDelDiaPorDepartamento);
router.post('/citas/agendar', agendarCita);
router.patch('/citas/:id/estado', cambiarEstadoCita);
router.get('/citas/:id', obtenerCitaPorId);

module.exports = router;

const express = require('express');
const controller = require('../controllers/solicitudesController');
const { requireRoles } = require('../utils/auth');
const { ROLES } = require('../data/store');

const router = express.Router();

router.post('/solicitudes', requireRoles([ROLES.CLIENTE]), controller.createSolicitud);
router.get('/solicitudes', controller.listSolicitudes);
router.get('/solicitudes/:id', controller.getSolicitud);
router.put('/solicitudes/:id', requireRoles([ROLES.CLIENTE]), controller.updateSolicitud);
router.post('/solicitudes/:id/enviar', requireRoles([ROLES.CLIENTE]), controller.enviarSolicitud);
router.post('/solicitudes/:id/solicitar-reanalisis', requireRoles([ROLES.ANALISTA]), controller.solicitarReanalisis);
router.post('/solicitudes/:id/reanalizar', requireRoles([ROLES.AGENTE]), controller.reanalizarSolicitud);
router.get('/solicitudes/:id/analisis', controller.getAnalisis);
router.post('/solicitudes/:id/revision', requireRoles([ROLES.ANALISTA]), controller.registrarRevision);
router.get('/solicitudes/:id/auditoria', controller.getAuditoria);

module.exports = router;

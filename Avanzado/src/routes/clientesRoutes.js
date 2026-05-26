const express = require('express');
const controller = require('../controllers/clientesController');
const { requireRoles } = require('../utils/auth');
const { ROLES } = require('../data/store');

const router = express.Router();

router.post('/clientes', requireRoles([ROLES.CLIENTE]), controller.createCliente);
router.get('/clientes', controller.listClientes);
router.get('/clientes/:id', controller.getCliente);
router.put('/clientes/:id', requireRoles([ROLES.CLIENTE]), controller.updateCliente);
router.delete('/clientes/:id', requireRoles([ROLES.CLIENTE]), controller.deleteCliente);
router.post('/clientes/:id/documentos', requireRoles([ROLES.CLIENTE]), controller.addDocumento);
router.get('/clientes/:id/documentos', controller.listDocumentos);

module.exports = router;

const express = require('express');
const controller = require('../controllers/creditosController');
const { requireRoles } = require('../utils/auth');
const { ROLES } = require('../data/store');

const router = express.Router();

router.post('/creditos', requireRoles([ROLES.ANALISTA]), controller.createCredito);
router.get('/creditos', controller.listCreditos);
router.get('/creditos/:id', controller.getCredito);
router.put('/creditos/:id', requireRoles([ROLES.ANALISTA]), controller.updateCredito);
router.delete('/creditos/:id', requireRoles([ROLES.ANALISTA]), controller.deleteCredito);
router.post('/creditos/:id/pagos', requireRoles([ROLES.CLIENTE]), controller.registrarPago);

module.exports = router;

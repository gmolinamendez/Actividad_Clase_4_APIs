const express = require('express');
const controller = require('../controllers/reportesController');

const router = express.Router();

router.get('/reportes', controller.getReportes);

module.exports = router;

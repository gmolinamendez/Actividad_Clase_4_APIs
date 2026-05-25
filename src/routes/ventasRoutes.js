const ventasRoutes = require('express').Router();
const { listarVentasDelDia, obtenerDetalleVenta, crearVenta } = require('../controllers/ventasController');

ventasRoutes.get('/ventas', listarVentasDelDia);
ventasRoutes.get('/ventas/:id', obtenerDetalleVenta);
ventasRoutes.post('/ventas', crearVenta);

module.exports = ventasRoutes;

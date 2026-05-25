const express = require('express');
const router = express.Router();
const { listarProductos, listarProductosStockBajo,obtenerProductoPorId, crearProducto, actualizarProducto, eliminarProducto } = require('../controllers/productosController');

// ruta para listar todos los productos
router.get('/productos', listarProductos);

router.get('/productos/stock-bajo', listarProductosStockBajo);

// ruta para obtener un producto por su ID
router.get('/productos/:id', obtenerProductoPorId);

// ruta para anadir un nuevo producto
router.post('/productos', crearProducto);

// ruta para actualizar un producto
router.put('/productos/:id', actualizarProducto);

// ruta para eliminar un producto
router.delete('/productos/:id', eliminarProducto);


module.exports = router;
const productos = require('../data/productos'); 

function listarProductos(req, res) {
  const { nombre, categoria } = req.query;

  if (productos.length === 0) {
    return res.status(404).send('No hay productos disponibles');
  }

  let productosFiltrados = productos;

  if (nombre) {
    productosFiltrados = productosFiltrados.filter(p =>
      String(p.nombre).toLowerCase().includes(nombre.toLowerCase())
    );
  }

  if (categoria) {
    productosFiltrados = productosFiltrados.filter(p =>
      String(p.categoria).toLowerCase().includes(categoria.toLowerCase())
    );
  }

  if (productosFiltrados.length === 0) {
    return res.status(404).send('No se encontraron productos');
  }

  res.send(productosFiltrados);
}

function listarProductosStockBajo(req, res) {
  const productosStockBajo = productos.filter(p => p.stock < 5);
  if (productosStockBajo.length === 0) {
    return res.status(404).send('No hay productos con stock bajo');
  }
  res.send(productosStockBajo);
}

function obtenerProductoPorId(req, res) {
  const { id } = req.params;
  const producto = productos.find(p => p.id === parseInt(id));
  if (!producto) {
    return res.status(404).send('Producto no encontrado');
  }
  res.send(producto);
}

function crearProducto(req, res) {
  const { nombre, categoria, precio, stock, vencimiento, proveedor } = req.body;
  const nuevoProducto = { id: productos.length + 1, nombre, categoria, precio, stock, vencimiento, proveedor };
  productos.push(nuevoProducto);
  res.status(201).send(`Producto creado: ${nombre} con precio ${precio}`);
}

function actualizarProducto(req, res) {
  const { id } = req.params;
  const { nombre, categoria, precio, stock, vencimiento, proveedor } = req.body;
  const producto = productos.find(p => p.id === parseInt(id));
  if (!producto) {
    return res.status(404).send('Producto no encontrado');
  }
  producto.nombre = nombre;
  producto.categoria = categoria;
  producto.precio = precio;
  producto.stock = stock;
  producto.vencimiento = vencimiento;
  producto.proveedor = proveedor;
  res.send(`Producto actualizado: ${nombre} con precio ${precio}`);
}

function eliminarProducto(req, res) {
  const { id } = req.params;
  const producto = productos.find(p => p.id === parseInt(id));
  if (!producto) {
    return res.status(404).send('Producto no encontrado');
  }
  productos.splice(productos.indexOf(producto), 1);
  res.send(`Producto con ID: ${id} eliminado`);
}

module.exports = {
  listarProductos,
  listarProductosStockBajo,
  obtenerProductoPorId,
  crearProducto,
  actualizarProducto,
  eliminarProducto
};

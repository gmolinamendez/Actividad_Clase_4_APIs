const productos = require('../data/productos');
const ventas = require('../data/ventas');

function esMismaFecha(fechaVenta, fechaActual) {
  const fecha = new Date(fechaVenta);
  return (
    fecha.getFullYear() === fechaActual.getFullYear() &&
    fecha.getMonth() === fechaActual.getMonth() &&
    fecha.getDate() === fechaActual.getDate()
  );
}

function listarVentasDelDia(req, res) {
  const hoy = new Date();
  const ventasDelDia = ventas.filter(venta => esMismaFecha(venta.fechaHora, hoy));

  if (ventasDelDia.length === 0) {
    return res.status(404).send('No hay ventas registradas hoy');
  }

  res.send(ventasDelDia);
}

function obtenerDetalleVenta(req, res) {
  const { id } = req.params;
  const venta = ventas.find(v => v.id === parseInt(id));
  if (!venta) {
    return res.status(404).send('Venta no encontrada');
  }
  res.send(venta);
}

function crearVenta(req, res) {
  const { productos: productosVendidos, metodoPago } = req.body;
  const metodosPermitidos = ['efectivo', 'tarjeta', 'transferencia'];

  if (!Array.isArray(productosVendidos) || productosVendidos.length === 0) {
    return res.status(400).send('La venta debe incluir al menos un producto');
  }

  if (!metodosPermitidos.includes(metodoPago)) {
    return res.status(400).send('Metodo de pago no valido');
  }

  const detalleVenta = [];
  let total = 0;

  for (const item of productosVendidos) {
    const productoId = parseInt(item.id);
    const cantidad = Number(item.cantidad);
    const producto = productos.find(p => p.id === productoId);

    if (!producto) {
      return res.status(404).send(`Producto con ID ${item.id} no encontrado`);
    }

    if (!Number.isFinite(cantidad) || cantidad <= 0) {
      return res.status(400).send(`Cantidad invalida para el producto ${producto.nombre}`);
    }

    if (producto.stock < cantidad) {
      return res.status(400).send(`Stock insuficiente para el producto ${producto.nombre}`);
    }

    const precioUnitario = Number(producto.precio);
    const subtotal = precioUnitario * cantidad;

    detalleVenta.push({
      productoId: producto.id,
      nombre: producto.nombre,
      cantidad,
      precioUnitario,
      subtotal
    });

    total += subtotal;
  }

  for (const item of detalleVenta) {
    const producto = productos.find(p => p.id === item.productoId);
    producto.stock -= item.cantidad;
  }

  const nuevaVenta = {
    id: ventas.length + 1,
    fechaHora: new Date().toISOString(),
    productos: detalleVenta,
    total,
    metodoPago
  };

  ventas.push(nuevaVenta);
  res.status(201).send(nuevaVenta);
}

module.exports = {
  listarVentasDelDia,
  obtenerDetalleVenta,
  crearVenta
};  

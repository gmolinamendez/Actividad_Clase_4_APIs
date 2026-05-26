const store = require('../data/store');

function createCliente(req, res) {
  const { nombre, documento, email, ingresos, tieneMoraPrevia } = req.body || {};
  if (!nombre || !documento) {
    return res.status(400).json({ error: 'nombre y documento son obligatorios' });
  }

  const cliente = {
    id: store.ids.cliente(),
    nombre,
    documento,
    email: email || null,
    ingresos: Number(ingresos || 0),
    tieneMoraPrevia: Boolean(tieneMoraPrevia),
    documentos: [],
    creadoEn: store.nowIso()
  };

  store.clientes.push(cliente);
  res.status(201).json(cliente);
}

function listClientes(req, res) {
  const { q, documento } = req.query;
  let resultado = [...store.clientes];

  if (documento) {
    resultado = resultado.filter((c) => c.documento === documento);
  }

  if (q) {
    const search = String(q).toLowerCase();
    resultado = resultado.filter((c) => c.nombre.toLowerCase().includes(search));
  }

  res.json(resultado);
}

function getCliente(req, res) {
  const cliente = store.findById(store.clientes, Number(req.params.id));
  if (!cliente) return res.status(404).json({ error: 'Cliente no encontrado' });
  res.json(cliente);
}

function updateCliente(req, res) {
  const cliente = store.findById(store.clientes, Number(req.params.id));
  if (!cliente) return res.status(404).json({ error: 'Cliente no encontrado' });

  const { nombre, documento, email, ingresos, tieneMoraPrevia } = req.body || {};
  if (nombre !== undefined) cliente.nombre = nombre;
  if (documento !== undefined) cliente.documento = documento;
  if (email !== undefined) cliente.email = email;
  if (ingresos !== undefined) cliente.ingresos = Number(ingresos || 0);
  if (tieneMoraPrevia !== undefined) cliente.tieneMoraPrevia = Boolean(tieneMoraPrevia);

  res.json(cliente);
}

function deleteCliente(req, res) {
  const id = Number(req.params.id);
  const index = store.clientes.findIndex((c) => c.id === id);
  if (index === -1) return res.status(404).json({ error: 'Cliente no encontrado' });
  const [removed] = store.clientes.splice(index, 1);
  res.json(removed);
}

function addDocumento(req, res) {
  const cliente = store.findById(store.clientes, Number(req.params.id));
  if (!cliente) return res.status(404).json({ error: 'Cliente no encontrado' });

  const { tipo, nombre, url } = req.body || {};
  if (!tipo || !nombre) {
    return res.status(400).json({ error: 'tipo y nombre son obligatorios' });
  }

  const documento = {
    id: `${cliente.id}-${cliente.documentos.length + 1}`,
    tipo,
    nombre,
    url: url || null,
    creadoEn: store.nowIso()
  };

  cliente.documentos.push(documento);
  res.status(201).json(documento);
}

function listDocumentos(req, res) {
  const cliente = store.findById(store.clientes, Number(req.params.id));
  if (!cliente) return res.status(404).json({ error: 'Cliente no encontrado' });
  res.json(cliente.documentos);
}

module.exports = {
  createCliente,
  listClientes,
  getCliente,
  updateCliente,
  deleteCliente,
  addDocumento,
  listDocumentos
};

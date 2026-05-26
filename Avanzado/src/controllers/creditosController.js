const store = require('../data/store');

function createCredito(req, res) {
  const { solicitudId, clienteId, monto, plazo } = req.body || {};
  if (!clienteId || !monto || !plazo) {
    return res.status(400).json({ error: 'clienteId, monto y plazo son obligatorios' });
  }

  const credito = {
    id: store.ids.credito(),
    solicitudId: solicitudId ? Number(solicitudId) : null,
    clienteId: Number(clienteId),
    monto: Number(monto),
    plazo: Number(plazo),
    saldo: Number(monto),
    estadoCredito: 'activo',
    estadoMora: 'en_mora',
    pagos: [],
    creadoEn: store.nowIso()
  };

  store.actualizarEstadoMora(credito);
  store.creditos.push(credito);
  res.status(201).json(credito);
}

function listCreditos(req, res) {
  const { clienteId, estadoMora, saldoMin, saldoMax } = req.query;
  let resultado = [...store.creditos];

  resultado.forEach(store.actualizarEstadoMora);

  if (clienteId) {
    resultado = resultado.filter((c) => c.clienteId === Number(clienteId));
  }

  if (estadoMora) {
    resultado = resultado.filter((c) => c.estadoMora === estadoMora);
  }

  if (saldoMin) {
    resultado = resultado.filter((c) => c.saldo >= Number(saldoMin));
  }

  if (saldoMax) {
    resultado = resultado.filter((c) => c.saldo <= Number(saldoMax));
  }

  res.json(resultado);
}

function getCredito(req, res) {
  const credito = store.findById(store.creditos, Number(req.params.id));
  if (!credito) return res.status(404).json({ error: 'Credito no encontrado' });
  store.actualizarEstadoMora(credito);
  res.json(credito);
}

function updateCredito(req, res) {
  const credito = store.findById(store.creditos, Number(req.params.id));
  if (!credito) return res.status(404).json({ error: 'Credito no encontrado' });

  const { monto, plazo } = req.body || {};
  if (monto !== undefined) {
    credito.monto = Number(monto);
  }
  if (plazo !== undefined) {
    credito.plazo = Number(plazo);
  }
  store.actualizarEstadoMora(credito);
  res.json(credito);
}

function deleteCredito(req, res) {
  const id = Number(req.params.id);
  const index = store.creditos.findIndex((c) => c.id === id);
  if (index === -1) return res.status(404).json({ error: 'Credito no encontrado' });
  const [removed] = store.creditos.splice(index, 1);
  res.json(removed);
}

function registrarPago(req, res) {
  const credito = store.findById(store.creditos, Number(req.params.id));
  if (!credito) return res.status(404).json({ error: 'Credito no encontrado' });

  const { monto, fecha } = req.body || {};
  if (!monto) {
    return res.status(400).json({ error: 'monto es obligatorio' });
  }

  const pago = {
    monto: Number(monto),
    fecha: fecha || store.nowIso()
  };

  credito.pagos.push(pago);
  credito.saldo = Math.max(0, credito.saldo - pago.monto);
  store.actualizarEstadoMora(credito);
  res.json(credito);
}

module.exports = {
  createCredito,
  listCreditos,
  getCredito,
  updateCredito,
  deleteCredito,
  registrarPago
};

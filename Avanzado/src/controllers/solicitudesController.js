const store = require('../data/store');
const { getActorName } = require('../utils/auth');

function createSolicitud(req, res) {
  const { clienteId, monto, plazo, proposito } = req.body || {};
  if (!clienteId || !monto || !plazo) {
    return res.status(400).json({ error: 'clienteId, monto y plazo son obligatorios' });
  }

  const cliente = store.findById(store.clientes, Number(clienteId));
  if (!cliente) return res.status(404).json({ error: 'Cliente no encontrado' });

  const solicitud = {
    id: store.ids.solicitud(),
    clienteId: Number(clienteId),
    monto: Number(monto),
    plazo: Number(plazo),
    proposito: proposito || null,
    estado: store.ESTADOS_SOLICITUD.BORRADOR,
    analisisId: null,
    reanalisisSolicitado: false,
    creadoEn: store.nowIso(),
    fechaEnvio: null,
    fechaResolucion: null,
    ultimoAnalisisEn: null
  };

  store.solicitudes.push(solicitud);
  store.addAuditEntry({
    solicitudId: solicitud.id,
    actorRole: store.ROLES.CLIENTE,
    actorName: getActorName(req),
    accion: 'crear',
    from: null,
    to: store.ESTADOS_SOLICITUD.BORRADOR
  });

  res.status(201).json(solicitud);
}

function listSolicitudes(req, res) {
  const { estado, clienteId, minMonto, maxMonto, scoreMin, scoreMax, q } = req.query;
  let resultado = [...store.solicitudes];

  if (estado) {
    resultado = resultado.filter((s) => s.estado === estado);
  }

  if (clienteId) {
    resultado = resultado.filter((s) => s.clienteId === Number(clienteId));
  }

  if (minMonto) {
    resultado = resultado.filter((s) => s.monto >= Number(minMonto));
  }

  if (maxMonto) {
    resultado = resultado.filter((s) => s.monto <= Number(maxMonto));
  }

  if (q) {
    const search = String(q).toLowerCase();
    resultado = resultado.filter((s) => (s.proposito || '').toLowerCase().includes(search));
  }

  if (scoreMin || scoreMax) {
    resultado = resultado.filter((s) => {
      const data = s.analisisId ? store.findById(store.analisis, s.analisisId) : null;
      if (!data) return false;
      if (scoreMin && data.score < Number(scoreMin)) return false;
      if (scoreMax && data.score > Number(scoreMax)) return false;
      return true;
    });
  }

  res.json(resultado);
}

function getSolicitud(req, res) {
  const solicitud = store.findById(store.solicitudes, Number(req.params.id));
  if (!solicitud) return res.status(404).json({ error: 'Solicitud no encontrada' });
  res.json(solicitud);
}

function updateSolicitud(req, res) {
  const solicitud = store.findById(store.solicitudes, Number(req.params.id));
  if (!solicitud) return res.status(404).json({ error: 'Solicitud no encontrada' });

  if (solicitud.estado !== store.ESTADOS_SOLICITUD.BORRADOR) {
    return res.status(400).json({ error: 'Solo se puede editar en estado borrador' });
  }

  const { monto, plazo, proposito } = req.body || {};
  if (monto !== undefined) solicitud.monto = Number(monto);
  if (plazo !== undefined) solicitud.plazo = Number(plazo);
  if (proposito !== undefined) solicitud.proposito = proposito;

  res.json(solicitud);
}

function enviarSolicitud(req, res) {
  const solicitud = store.findById(store.solicitudes, Number(req.params.id));
  if (!solicitud) return res.status(404).json({ error: 'Solicitud no encontrada' });
  if (solicitud.estado !== store.ESTADOS_SOLICITUD.BORRADOR) {
    return res.status(400).json({ error: 'Solo se puede enviar una solicitud en borrador' });
  }

  solicitud.fechaEnvio = store.nowIso();
  store.setEstadoSolicitud(
    solicitud,
    store.ESTADOS_SOLICITUD.ENVIADA,
    store.ROLES.CLIENTE,
    getActorName(req),
    'enviar'
  );

  const resultado = store.ejecutarAnalisisAutomatico(solicitud, 'agentcredit-ai');
  res.json({ solicitud, analisis: resultado });
}

function solicitarReanalisis(req, res) {
  const solicitud = store.findById(store.solicitudes, Number(req.params.id));
  if (!solicitud) return res.status(404).json({ error: 'Solicitud no encontrada' });
  if (solicitud.estado !== store.ESTADOS_SOLICITUD.EN_REVISION) {
    return res.status(400).json({ error: 'Solo se puede solicitar reanalisis en revision' });
  }

  solicitud.reanalisisSolicitado = true;
  store.setEstadoSolicitud(
    solicitud,
    store.ESTADOS_SOLICITUD.BORRADOR,
    store.ROLES.ANALISTA,
    getActorName(req),
    'solicitar_reanalisis'
  );

  res.json(solicitud);
}

function reanalizarSolicitud(req, res) {
  const solicitud = store.findById(store.solicitudes, Number(req.params.id));
  if (!solicitud) return res.status(404).json({ error: 'Solicitud no encontrada' });
  if (solicitud.estado !== store.ESTADOS_SOLICITUD.ENVIADA) {
    return res.status(400).json({ error: 'Solo se reanaliza cuando esta enviada' });
  }

  const resultado = store.ejecutarAnalisisAutomatico(solicitud, getActorName(req));
  res.json({ solicitud, analisis: resultado });
}

function getAnalisis(req, res) {
  const solicitud = store.findById(store.solicitudes, Number(req.params.id));
  if (!solicitud) return res.status(404).json({ error: 'Solicitud no encontrada' });
  const resultado = solicitud.analisisId ? store.findById(store.analisis, solicitud.analisisId) : null;
  if (!resultado) return res.status(404).json({ error: 'Analisis no encontrado' });
  res.json(resultado);
}

function registrarRevision(req, res) {
  const solicitud = store.findById(store.solicitudes, Number(req.params.id));
  if (!solicitud) return res.status(404).json({ error: 'Solicitud no encontrada' });
  if (solicitud.estado !== store.ESTADOS_SOLICITUD.EN_REVISION) {
    return res.status(400).json({ error: 'Solo se puede revisar en estado en_revision' });
  }

  const { decision, justificacion, docsAdicionalesSolicitados } = req.body || {};
  if (!decision || !justificacion) {
    return res.status(400).json({ error: 'decision y justificacion son obligatorios' });
  }

  if (![store.ESTADOS_SOLICITUD.APROBADA, store.ESTADOS_SOLICITUD.RECHAZADA].includes(decision)) {
    return res.status(400).json({ error: 'decision debe ser aprobada o rechazada' });
  }

  solicitud.revision = {
    analista: getActorName(req),
    decision,
    justificacion,
    docsAdicionalesSolicitados: docsAdicionalesSolicitados || null,
    fecha: store.nowIso()
  };

  solicitud.fechaResolucion = store.nowIso();
  store.setEstadoSolicitud(
    solicitud,
    decision,
    store.ROLES.ANALISTA,
    getActorName(req),
    'decision_final'
  );

  res.json(solicitud);
}

function getAuditoria(req, res) {
  const solicitud = store.findById(store.solicitudes, Number(req.params.id));
  if (!solicitud) return res.status(404).json({ error: 'Solicitud no encontrada' });

  const historial = store.auditoria.filter((a) => a.solicitudId === solicitud.id);
  res.json(historial);
}

module.exports = {
  createSolicitud,
  listSolicitudes,
  getSolicitud,
  updateSolicitud,
  enviarSolicitud,
  solicitarReanalisis,
  reanalizarSolicitud,
  getAnalisis,
  registrarRevision,
  getAuditoria
};

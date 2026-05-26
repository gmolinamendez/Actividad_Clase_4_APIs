const ESTADOS_SOLICITUD = {
  BORRADOR: 'borrador',
  ENVIADA: 'enviada',
  EN_ANALISIS: 'en_analisis',
  EN_REVISION: 'en_revision',
  APROBADA: 'aprobada',
  RECHAZADA: 'rechazada'
};

const ROLES = {
  CLIENTE: 'cliente',
  AGENTE: 'agente',
  ANALISTA: 'analista'
};

// Datos en memoria para el ejercicio.
const clientes = [];
const solicitudes = [];
const analisis = [];
const creditos = [];
const auditoria = [];

let nextClienteId = 1;
let nextSolicitudId = 1;
let nextAnalisisId = 1;
let nextCreditoId = 1;
let nextAuditoriaId = 1;

const ids = {
  cliente: () => nextClienteId++,
  solicitud: () => nextSolicitudId++,
  analisis: () => nextAnalisisId++,
  credito: () => nextCreditoId++,
  auditoria: () => nextAuditoriaId++
};

function nowIso() {
  return new Date().toISOString();
}

function findById(list, id) {
  return list.find((item) => item.id === id);
}

function addAuditEntry({ solicitudId, actorRole, actorName, accion, from, to }) {
  auditoria.push({
    id: ids.auditoria(),
    solicitudId,
    actorRole,
    actorName,
    accion,
    from,
    to,
    fecha: nowIso()
  });
}

function setEstadoSolicitud(solicitud, nuevoEstado, actorRole, actorName, accion) {
  const estadoAnterior = solicitud.estado;
  solicitud.estado = nuevoEstado;
  addAuditEntry({
    solicitudId: solicitud.id,
    actorRole,
    actorName,
    accion,
    from: estadoAnterior,
    to: nuevoEstado
  });
}

function clampScore(value) {
  if (value < 0) return 0;
  if (value > 100) return 100;
  return Math.round(value);
}

function calcularAnalisis(solicitud, cliente) {
  const ingresos = Number(cliente.ingresos || 0);
  const monto = Number(solicitud.monto || 0);
  const plazo = Number(solicitud.plazo || 0);
  const ratio = ingresos > 0 ? monto / ingresos : 1;

  let score = 100;
  score -= ratio * 40;
  score -= Math.min(plazo, 60) * 0.5;
  score -= cliente.tieneMoraPrevia ? 25 : 0;
  score = clampScore(score);

  const variables = [
    { nombre: 'ingresos', valor: ingresos, impacto: ingresos > 0 ? 'positivo' : 'negativo' },
    { nombre: 'monto', valor: monto, impacto: monto > ingresos ? 'negativo' : 'neutral' },
    { nombre: 'plazo', valor: plazo, impacto: plazo > 24 ? 'negativo' : 'neutral' },
    { nombre: 'mora_previa', valor: Boolean(cliente.tieneMoraPrevia), impacto: cliente.tieneMoraPrevia ? 'negativo' : 'neutral' }
  ];

  return {
    id: ids.analisis(),
    solicitudId: solicitud.id,
    score,
    variables,
    recomendacion: score >= 65 ? 'aprobar' : 'rechazar',
    confianza: score >= 65 ? 0.78 : 0.62,
    versionModelo: 'agentcredit-ai-1.0',
    creadoEn: nowIso()
  };
}

function ejecutarAnalisisAutomatico(solicitud, actorName) {
  const cliente = findById(clientes, solicitud.clienteId);
  if (!cliente) return null;

  setEstadoSolicitud(solicitud, ESTADOS_SOLICITUD.EN_ANALISIS, ROLES.AGENTE, actorName, 'inicio_analisis');
  const resultado = calcularAnalisis(solicitud, cliente);
  analisis.push(resultado);
  solicitud.analisisId = resultado.id;
  solicitud.reanalisisSolicitado = false;
  solicitud.ultimoAnalisisEn = resultado.creadoEn;
  setEstadoSolicitud(solicitud, ESTADOS_SOLICITUD.EN_REVISION, ROLES.AGENTE, actorName, 'fin_analisis');
  return resultado;
}

function actualizarEstadoMora(credito) {
  if (credito.saldo <= 0) {
    credito.estadoCredito = 'cancelado';
    credito.estadoMora = 'al_dia';
    return;
  }

  const ultimoPago = credito.pagos[credito.pagos.length - 1];
  if (!ultimoPago) {
    credito.estadoMora = 'en_mora';
    return;
  }

  const dias = (Date.now() - new Date(ultimoPago.fecha).getTime()) / (1000 * 60 * 60 * 24);
  credito.estadoMora = dias > 30 ? 'en_mora' : 'al_dia';
}

module.exports = {
  ESTADOS_SOLICITUD,
  ROLES,
  clientes,
  solicitudes,
  analisis,
  creditos,
  auditoria,
  ids,
  nowIso,
  findById,
  addAuditEntry,
  setEstadoSolicitud,
  ejecutarAnalisisAutomatico,
  actualizarEstadoMora
};

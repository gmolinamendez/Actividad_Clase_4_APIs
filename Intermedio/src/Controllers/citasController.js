const citas = require('../Data/citas');
const medicos = require('../Data/medicos');
const pacientes = require('../Data/pacientes');
const {
  estaDentroDelHorario,
  esMismaFecha,
  mismaFechaHora
} = require('../utils/horarios');
const { validarTransicionEstado } = require('../utils/transicionesCita');

const estadosOperativos = ['activo', 'guardia'];

function obtenerCitaPorId(req, res) {
  const { id } = req.params;
  const cita = citas.find(c => c.id === parseInt(id, 10));
  if (!cita) {
    return res.status(404).send('Cita no encontrada');
  }
  res.send(cita);
}

function agendarCita(req, res) {
  const { paciente, medico, fechaHora, motivo, departamento } = req.body;

  if (!paciente || !medico || !fechaHora || !motivo || !departamento) {
    return res.status(400).send(
      'paciente, medico, fechaHora, motivo y departamento son obligatorios'
    );
  }

  const pacienteId = parseInt(paciente, 10);
  const medicoId = parseInt(medico, 10);

  if (!pacientes.find(p => p.id === pacienteId)) {
    return res.status(404).send('Paciente no encontrado');
  }

  const medicoAsignado = medicos.find(m => m.id === medicoId);
  if (!medicoAsignado) {
    return res.status(404).send('Medico no encontrado');
  }

  if (!estadosOperativos.includes(medicoAsignado.estado)) {
    return res.status(409).send(
      `El medico no esta disponible (estado: ${medicoAsignado.estado})`
    );
  }

  if (!estaDentroDelHorario(medicoAsignado.horarioAtencion, fechaHora)) {
    return res.status(409).send(
      'El medico no atiende en ese horario segun su horario de atencion'
    );
  }

  const conflicto = citas.find(
    c =>
      c.medico === medicoId &&
      c.estado !== 'cancelada' &&
      mismaFechaHora(c.fechaHora, fechaHora)
  );

  if (conflicto) {
    return res.status(409).send(
      'El medico ya tiene una cita programada en ese horario especifico'
    );
  }

  const id = citas.length > 0 ? Math.max(...citas.map(c => c.id)) + 1 : 1;

  const nuevaCita = {
    id,
    paciente: pacienteId,
    medico: medicoId,
    fechaHora,
    motivo,
    estado: 'programada',
    departamento
  };

  citas.push(nuevaCita);
  res.status(201).send(nuevaCita);
}

function cambiarEstadoCita(req, res) {
  const citaId = parseInt(req.params.id, 10);
  const { estado: estadoNuevo } = req.body;

  if (!estadoNuevo) {
    return res.status(400).send('Debe enviar el nuevo estado en el body');
  }

  const cita = citas.find(c => c.id === citaId);
  if (!cita) {
    return res.status(404).send('Cita no encontrada');
  }

  const resultado = validarTransicionEstado(cita.estado, estadoNuevo);
  if (!resultado.valida) {
    return res.status(400).send(resultado.mensaje);
  }

  cita.estado = estadoNuevo;
  res.send(cita);
}

function citasDelDiaPorDepartamento(req, res) {
  const hoy = new Date();

  const citasHoy = citas.filter(
    c => esMismaFecha(c.fechaHora, hoy) && c.estado !== 'cancelada'
  );

  if (citasHoy.length === 0) {
    return res.status(404).send('No hay citas programadas para el dia de hoy');
  }

  const porDepartamento = citasHoy.reduce((agrupado, cita) => {
    const depto = cita.departamento || 'Sin departamento';
    if (!agrupado[depto]) {
      agrupado[depto] = [];
    }
    agrupado[depto].push(cita);
    return agrupado;
  }, {});

  for (const depto of Object.keys(porDepartamento)) {
    porDepartamento[depto].sort(
      (a, b) => new Date(a.fechaHora) - new Date(b.fechaHora)
    );
  }

  res.send({
    fecha: hoy.toISOString().split('T')[0],
    totalCitas: citasHoy.length,
    departamentos: porDepartamento
  });
}

module.exports = {
  obtenerCitaPorId,
  agendarCita,
  cambiarEstadoCita,
  citasDelDiaPorDepartamento
};

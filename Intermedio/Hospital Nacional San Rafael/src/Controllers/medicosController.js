const medicos = require('../Data/medicos');
const citas = require('../Data/citas');
const {
  rangoHorarioCubierto,
  esMismaFecha,
  minutosDesdeMedianoche
} = require('../utils/horarios');

function citaSolapaRango(cita, horaInicio, horaFin, fechaReferencia) {
  if (!esMismaFecha(cita.fechaHora, fechaReferencia)) {
    return false;
  }

  const minutosCita = minutosDesdeMedianoche(
    `${new Date(cita.fechaHora).getHours().toString().padStart(2, '0')}:${new Date(cita.fechaHora).getMinutes().toString().padStart(2, '0')}`
  );
  const inicio = minutosDesdeMedianoche(horaInicio);
  const fin = minutosDesdeMedianoche(horaFin);

  return minutosCita >= inicio && minutosCita < fin;
}

const estadosPermitidos = ['activo', 'guardia', 'fuera de servicio'];
const estadosOperativos = ['activo', 'guardia'];

function listarMedicos(req, res) {
  if (medicos.length === 0) {
    return res.status(404).send('No hay medicos registrados');
  }
  res.send(medicos);
}

function listarMedicosDisponibles(req, res) {
  const { especialidad, horaInicio, horaFin, fecha } = req.query;

  if (!especialidad || !horaInicio || !horaFin) {
    return res.status(400).send(
      'Use query params: especialidad, horaInicio y horaFin (formato HH:MM). Opcional: fecha (ISO)'
    );
  }

  const fechaReferencia = fecha ? new Date(fecha) : new Date();
  if (Number.isNaN(fechaReferencia.getTime())) {
    return res.status(400).send('fecha invalida');
  }

  const candidatos = medicos.filter(
    m =>
      estadosOperativos.includes(m.estado) &&
      String(m.especialidad).toLowerCase() === especialidad.toLowerCase() &&
      rangoHorarioCubierto(m.horarioAtencion, horaInicio, horaFin)
  );

  const disponibles = candidatos.filter(medico => {
    const tieneConflicto = citas.some(
      c =>
        c.medico === medico.id &&
        c.estado !== 'cancelada' &&
        citaSolapaRango(c, horaInicio, horaFin, fechaReferencia)
    );
    return !tieneConflicto;
  });

  if (disponibles.length === 0) {
    return res.status(404).send(
      'No hay medicos disponibles para esa especialidad y rango horario'
    );
  }

  res.send(disponibles);
}

function obtenerMedicoPorId(req, res) {
  const { id } = req.params;
  const medico = medicos.find(m => m.id === parseInt(id, 10));
  if (!medico) {
    return res.status(404).send('Medico no encontrado');
  }
  res.send(medico);
}

function crearMedico(req, res) {
  const { nombre, especialidad, departamento, horarioAtencion, estado } = req.body;

  if (!estadosPermitidos.includes(estado)) {
    return res.status(400).send('Estado no valido. Use: activo, guardia o fuera de servicio');
  }

  const id = medicos.length > 0 ? Math.max(...medicos.map(m => m.id)) + 1 : 1;

  const nuevoMedico = {
    id,
    nombre,
    especialidad,
    departamento,
    horarioAtencion,
    estado
  };

  medicos.push(nuevoMedico);
  res.status(201).send(nuevoMedico);
}

function actualizarMedico(req, res) {
  const { id } = req.params;
  const { nombre, especialidad, departamento, horarioAtencion, estado } = req.body;

  const medico = medicos.find(m => m.id === parseInt(id, 10));
  if (!medico) {
    return res.status(404).send('Medico no encontrado');
  }

  if (estado && !estadosPermitidos.includes(estado)) {
    return res.status(400).send('Estado no valido. Use: activo, guardia o fuera de servicio');
  }

  medico.nombre = nombre ?? medico.nombre;
  medico.especialidad = especialidad ?? medico.especialidad;
  medico.departamento = departamento ?? medico.departamento;
  medico.horarioAtencion = horarioAtencion ?? medico.horarioAtencion;
  medico.estado = estado ?? medico.estado;

  res.send(medico);
}

function eliminarMedico(req, res) {
  const { id } = req.params;
  const indice = medicos.findIndex(m => m.id === parseInt(id, 10));
  if (indice === -1) {
    return res.status(404).send('Medico no encontrado');
  }
  medicos.splice(indice, 1);
  res.send(`Medico con ID: ${id} eliminado`);
}

module.exports = {
  listarMedicos,
  listarMedicosDisponibles,
  obtenerMedicoPorId,
  crearMedico,
  actualizarMedico,
  eliminarMedico
};

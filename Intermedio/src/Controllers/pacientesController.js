const pacientes = require('../Data/pacientes');
const expedientes = require('../Data/expedientes');
const citas = require('../Data/citas');

function generarNumeroExpediente(id) {
  return `EXP-${String(id).padStart(4, '0')}`;
}

function listarPacientes(req, res) {
  if (pacientes.length === 0) {
    return res.status(404).send('No hay pacientes registrados');
  }
  res.send(pacientes);
}

function buscarPacientes(req, res) {
  const { nombre, dui, numeroExpediente } = req.query;

  if (!nombre && !dui && !numeroExpediente) {
    return res.status(400).send(
      'Debe indicar al menos un criterio de busqueda: nombre, dui o numeroExpediente (query params)'
    );
  }

  let resultados = pacientes;

  if (nombre) {
    resultados = resultados.filter(p =>
      String(p.nombreCompleto).toLowerCase().includes(nombre.toLowerCase())
    );
  }

  if (dui) {
    resultados = resultados.filter(p =>
      String(p.duiPasaporte).toLowerCase().includes(dui.toLowerCase())
    );
  }

  if (numeroExpediente) {
    resultados = resultados.filter(p =>
      String(p.numeroExpediente).toLowerCase() === numeroExpediente.toLowerCase()
    );
  }

  if (resultados.length === 0) {
    return res.status(404).send('No se encontraron pacientes con esos criterios');
  }

  res.send(resultados);
}

function obtenerPacientePorId(req, res) {
  const { id } = req.params;
  const paciente = pacientes.find(p => p.id === parseInt(id, 10));
  if (!paciente) {
    return res.status(404).send('Paciente no encontrado');
  }
  res.send(paciente);
}

function crearPaciente(req, res) {
  const {
    duiPasaporte,
    nombreCompleto,
    tipoSangre,
    alergias,
    contactoEmergencia,
    seguroMedico
  } = req.body;

  if (!duiPasaporte || !nombreCompleto) {
    return res.status(400).send('duiPasaporte y nombreCompleto son obligatorios');
  }

  const duiDuplicado = pacientes.some(
    p => String(p.duiPasaporte).toLowerCase() === String(duiPasaporte).toLowerCase()
  );
  if (duiDuplicado) {
    return res.status(409).send('Ya existe un paciente con ese DUI o pasaporte');
  }

  const id = pacientes.length > 0 ? Math.max(...pacientes.map(p => p.id)) + 1 : 1;

  const nuevoPaciente = {
    id,
    numeroExpediente: generarNumeroExpediente(id),
    duiPasaporte,
    nombreCompleto,
    tipoSangre,
    alergias,
    contactoEmergencia,
    seguroMedico
  };

  pacientes.push(nuevoPaciente);
  res.status(201).send(nuevoPaciente);
}

function actualizarPaciente(req, res) {
  const { id } = req.params;
  const {
    duiPasaporte,
    nombreCompleto,
    tipoSangre,
    alergias,
    contactoEmergencia,
    seguroMedico
  } = req.body;

  const paciente = pacientes.find(p => p.id === parseInt(id, 10));
  if (!paciente) {
    return res.status(404).send('Paciente no encontrado');
  }

  paciente.duiPasaporte = duiPasaporte ?? paciente.duiPasaporte;
  paciente.nombreCompleto = nombreCompleto ?? paciente.nombreCompleto;
  paciente.tipoSangre = tipoSangre ?? paciente.tipoSangre;
  paciente.alergias = alergias ?? paciente.alergias;
  paciente.contactoEmergencia = contactoEmergencia ?? paciente.contactoEmergencia;
  paciente.seguroMedico = seguroMedico ?? paciente.seguroMedico;

  res.send(paciente);
}

function eliminarPaciente(req, res) {
  const { id } = req.params;
  const indice = pacientes.findIndex(p => p.id === parseInt(id, 10));
  if (indice === -1) {
    return res.status(404).send('Paciente no encontrado');
  }
  pacientes.splice(indice, 1);
  res.send(`Paciente con ID: ${id} eliminado`);
}

function agregarEntradaExpediente(req, res) {
  const pacienteId = parseInt(req.params.pacienteId, 10);
  const paciente = pacientes.find(p => p.id === pacienteId);

  if (!paciente) {
    return res.status(404).send('Paciente no encontrado');
  }

  const {
    citaAsociada,
    diagnostico,
    medicamentos,
    indicaciones,
    proximaCitaSugerida,
    medicoQueAtiende
  } = req.body;

  if (!citaAsociada || !diagnostico || !medicoQueAtiende) {
    return res.status(400).send(
      'citaAsociada, diagnostico y medicoQueAtiende son obligatorios'
    );
  }

  const cita = citas.find(c => c.id === parseInt(citaAsociada, 10));
  if (!cita) {
    return res.status(404).send('La cita asociada no existe');
  }

  if (cita.paciente !== pacienteId) {
    return res.status(400).send(
      'La cita asociada no pertenece a este paciente'
    );
  }

  if (cita.estado !== 'completada') {
    return res.status(400).send(
      'Solo se puede registrar expediente de citas en estado completada'
    );
  }

  const id =
    expedientes.length > 0 ? Math.max(...expedientes.map(e => e.id)) + 1 : 1;

  const nuevaEntrada = {
    id,
    pacienteId,
    citaAsociada: cita.id,
    diagnostico,
    medicamentos,
    indicaciones,
    proximaCitaSugerida,
    medicoQueAtiende,
    fechaConsulta: cita.fechaHora
  };

  expedientes.push(nuevaEntrada);
  res.status(201).send(nuevaEntrada);
}

function obtenerHistorialClinico(req, res) {
  const pacienteId = parseInt(req.params.pacienteId, 10);
  const paciente = pacientes.find(p => p.id === pacienteId);

  if (!paciente) {
    return res.status(404).send('Paciente no encontrado');
  }

  const entradasPaciente = expedientes
    .filter(e => e.pacienteId === pacienteId)
    .map(entrada => {
      const cita = citas.find(c => c.id === entrada.citaAsociada);
      return {
        ...entrada,
        fechaConsulta: entrada.fechaConsulta || (cita ? cita.fechaHora : null)
      };
    })
    .sort(
      (a, b) => new Date(a.fechaConsulta) - new Date(b.fechaConsulta)
    );

  res.send({
    pacienteId,
    numeroExpediente: paciente.numeroExpediente,
    nombreCompleto: paciente.nombreCompleto,
    totalConsultas: entradasPaciente.length,
    historial: entradasPaciente
  });
}

module.exports = {
  listarPacientes,
  buscarPacientes,
  obtenerPacientePorId,
  crearPaciente,
  actualizarPaciente,
  eliminarPaciente,
  agregarEntradaExpediente,
  obtenerHistorialClinico
};

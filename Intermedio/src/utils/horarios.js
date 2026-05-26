function minutosDesdeMedianoche(hora) {
  const [horas, minutos] = String(hora).split(':').map(Number);
  if (!Number.isFinite(horas) || !Number.isFinite(minutos)) {
    return null;
  }
  return horas * 60 + minutos;
}

function normalizarHorarioAtencion(horarioAtencion) {
  if (!horarioAtencion) {
    return null;
  }

  if (typeof horarioAtencion === 'string') {
    const [inicio, fin] = horarioAtencion.split('-').map(parte => parte.trim());
    return { inicio, fin };
  }

  if (horarioAtencion.inicio && horarioAtencion.fin) {
    return { inicio: horarioAtencion.inicio, fin: horarioAtencion.fin };
  }

  return null;
}

function estaDentroDelHorario(horarioAtencion, fechaHora) {
  const horario = normalizarHorarioAtencion(horarioAtencion);
  if (!horario) {
    return false;
  }

  const inicio = minutosDesdeMedianoche(horario.inicio);
  const fin = minutosDesdeMedianoche(horario.fin);
  if (inicio === null || fin === null) {
    return false;
  }

  const fecha = new Date(fechaHora);
  if (Number.isNaN(fecha.getTime())) {
    return false;
  }

  const minutosCita = fecha.getHours() * 60 + fecha.getMinutes();
  return minutosCita >= inicio && minutosCita < fin;
}

function rangoHorarioCubierto(horarioAtencion, horaInicio, horaFin) {
  const horario = normalizarHorarioAtencion(horarioAtencion);
  if (!horario) {
    return false;
  }

  const inicioMedico = minutosDesdeMedianoche(horario.inicio);
  const finMedico = minutosDesdeMedianoche(horario.fin);
  const inicioConsulta = minutosDesdeMedianoche(horaInicio);
  const finConsulta = minutosDesdeMedianoche(horaFin);

  if (
    inicioMedico === null ||
    finMedico === null ||
    inicioConsulta === null ||
    finConsulta === null
  ) {
    return false;
  }

  return inicioConsulta >= inicioMedico && finConsulta <= finMedico;
}

function esMismaFecha(fechaA, fechaB) {
  const a = new Date(fechaA);
  const b = new Date(fechaB);
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function mismaFechaHora(fechaA, fechaB) {
  return new Date(fechaA).getTime() === new Date(fechaB).getTime();
}

module.exports = {
  estaDentroDelHorario,
  rangoHorarioCubierto,
  esMismaFecha,
  mismaFechaHora,
  minutosDesdeMedianoche
};

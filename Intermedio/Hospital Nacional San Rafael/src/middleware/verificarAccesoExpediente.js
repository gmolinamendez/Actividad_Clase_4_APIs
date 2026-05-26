/**
 * Propuesta de control de acceso al expediente clinico.
 * Uso: enviar encabezados x-rol y x-usuario-id en las peticiones.
 *
 * Roles autorizados para lectura/escritura: medico, enfermeria, administracion.
 * Rol paciente: solo puede acceder a su propio expediente (pacienteId del path).
 */
function verificarAccesoExpediente(req, res, next) {
  const rol = req.headers['x-rol'];
  const usuarioId = parseInt(req.headers['x-usuario-id'], 10);
  const pacienteId = parseInt(req.params.pacienteId, 10);

  if (!rol) {
    return res.status(403).json({
      error: 'Acceso denegado al expediente clinico',
      mensaje: 'Falta el encabezado x-rol (medico, enfermeria, administracion o paciente)'
    });
  }

  const rolesStaff = ['medico', 'enfermeria', 'administracion'];

  if (rolesStaff.includes(rol)) {
    if (!Number.isFinite(usuarioId)) {
      return res.status(403).json({
        error: 'Acceso denegado al expediente clinico',
        mensaje: 'Personal autorizado debe enviar x-usuario-id'
      });
    }
    return next();
  }

  if (rol === 'paciente') {
    if (!Number.isFinite(usuarioId) || usuarioId !== pacienteId) {
      return res.status(403).json({
        error: 'Acceso denegado al expediente clinico',
        mensaje: 'Un paciente solo puede consultar o registrar entradas en su propio expediente'
      });
    }
    return next();
  }

  return res.status(403).json({
    error: 'Acceso denegado al expediente clinico',
    mensaje: `Rol "${rol}" no autorizado para expedientes`
  });
}

module.exports = verificarAccesoExpediente;

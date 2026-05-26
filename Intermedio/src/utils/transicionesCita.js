const TRANSICIONES_VALIDAS = {
  programada: ['en curso', 'cancelada'],
  'en curso': ['completada'],
  completada: [],
  cancelada: []
};

function validarTransicionEstado(estadoActual, estadoNuevo) {
  const destinosPermitidos = TRANSICIONES_VALIDAS[estadoActual];

  if (!destinosPermitidos) {
    return {
      valida: false,
      mensaje: `Estado actual "${estadoActual}" no es reconocido`
    };
  }

  if (!destinosPermitidos.includes(estadoNuevo)) {
    const permitidos =
      destinosPermitidos.length > 0
        ? destinosPermitidos.join('" o "')
        : 'ninguno (estado final)';

    return {
      valida: false,
      mensaje: `Transicion invalida: no se puede pasar de "${estadoActual}" a "${estadoNuevo}". Transiciones permitidas: "${permitidos}"`
    };
  }

  return { valida: true };
}

module.exports = { validarTransicionEstado, TRANSICIONES_VALIDAS };

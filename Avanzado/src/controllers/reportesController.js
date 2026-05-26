const store = require('../data/store');

function getReportes(req, res) {
  const finales = store.solicitudes.filter((s) => [
    store.ESTADOS_SOLICITUD.APROBADA,
    store.ESTADOS_SOLICITUD.RECHAZADA
  ].includes(s.estado));

  const bucketsScore = [
    { rango: '0-49', min: 0, max: 49 },
    { rango: '50-69', min: 50, max: 69 },
    { rango: '70-84', min: 70, max: 84 },
    { rango: '85-100', min: 85, max: 100 }
  ];

  const aprobacionPorScore = bucketsScore.map((bucket) => {
    const enBucket = finales.filter((s) => {
      const data = s.analisisId ? store.findById(store.analisis, s.analisisId) : null;
      if (!data) return false;
      return data.score >= bucket.min && data.score <= bucket.max;
    });

    const aprobadas = enBucket.filter((s) => s.estado === store.ESTADOS_SOLICITUD.APROBADA).length;
    return {
      rango: bucket.rango,
      total: enBucket.length,
      aprobadas,
      tasaAprobacion: enBucket.length ? Number((aprobadas / enBucket.length).toFixed(2)) : 0
    };
  });

  const tiempos = finales
    .filter((s) => s.fechaEnvio && s.fechaResolucion)
    .map((s) => (new Date(s.fechaResolucion) - new Date(s.fechaEnvio)) / (1000 * 60 * 60));

  const promedioResolucionHoras = tiempos.length
    ? Number((tiempos.reduce((a, b) => a + b, 0) / tiempos.length).toFixed(2))
    : 0;

  const distribucionMontos = [
    { rango: '0-999', min: 0, max: 999 },
    { rango: '1000-4999', min: 1000, max: 4999 },
    { rango: '5000-9999', min: 5000, max: 9999 },
    { rango: '10000+', min: 10000, max: Infinity }
  ].map((bucket) => ({
    rango: bucket.rango,
    total: store.solicitudes.filter((s) => s.monto >= bucket.min && s.monto <= bucket.max).length
  }));

  res.json({
    aprobacionPorScore,
    promedioResolucionHoras,
    distribucionMontos
  });
}

module.exports = {
  getReportes
};

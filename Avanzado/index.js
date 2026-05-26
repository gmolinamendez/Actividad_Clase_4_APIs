const express = require('express');

const clientesRoutes = require('./src/routes/clientesRoutes');
const solicitudesRoutes = require('./src/routes/solicitudesRoutes');
const creditosRoutes = require('./src/routes/creditosRoutes');
const reportesRoutes = require('./src/routes/reportesRoutes');

const app = express();

app.use(express.json());
app.use(clientesRoutes);
app.use(solicitudesRoutes);
app.use(creditosRoutes);
app.use(reportesRoutes);

app.get('/', (req, res) => {
  res.json({
    nombre: 'AgentCredit AI',
    mensaje: 'API de analisis predictivo de creditos'
  });
});

app.listen(3000, () => {
  console.log('Servidor escuchando en http://localhost:3000');
});

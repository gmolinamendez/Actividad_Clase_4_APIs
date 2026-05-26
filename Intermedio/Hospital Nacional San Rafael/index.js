const express = require('express');
const app = express();
const pacientesRoutes = require('./src/Routes/pacientesRoutes');
const medicosRoutes = require('./src/Routes/medicosRoutes');
const citasRoutes = require('./src/Routes/citasRoutes');

app.use(express.json());
app.use(pacientesRoutes);
app.use(medicosRoutes);
app.use(citasRoutes);

app.get('/', (req, res) => {
  res.send('Hospital Nacional San Rafael - API');
});

app.listen(3000, () => {
  console.log('Servidor escuchando en http://localhost:3000');
});

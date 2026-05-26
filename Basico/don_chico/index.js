const express = require('express');
const app = express();
const productosRoutes = require('./src/routes/productosRoutes');
const ventasRoutes = require('./src/routes/ventasRoutes');

app.use(express.json());
app.use(productosRoutes);
app.use(ventasRoutes);

app.get('/', (req, res) => {
  res.send('Hola, soy Don Chico');
});

app.listen(3000, () => {
  console.log('Servidor escuchando en el puerto 3000, http://localhost:3000/');
});

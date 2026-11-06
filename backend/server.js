const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

const mercadoriasRoutes =
    require('./routes/mercadorias');

app.use('/api/mercadorias', mercadoriasRoutes);

app.get('/', (req, res) => {
    res.send('API StockControl funcionando!');
});

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
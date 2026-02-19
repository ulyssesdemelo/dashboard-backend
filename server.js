const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middlewares
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());

// Rota de teste
app.get('/', (req, res) => {
  res.json({ message: 'API está funcionando!' });
});

// Rotas de autenticação
try {
  const authRoutes = require('./routes/auth');
  app.use('/api/auth', authRoutes);
  console.log('✅ Rotas de autenticação carregadas');
} catch (error) {
  console.error('❌ Erro ao carregar rotas:', error.message);
}

// Rotas de clientes dados
const clientesRoutes = require('./routes/clientes');
app.use('/api/clientes', clientesRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
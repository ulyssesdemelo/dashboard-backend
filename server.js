const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middlewares - CORS permitindo múltiplas origens
const allowedOrigins = [
  'http://localhost:3000',
  'https://dashboard-frontend-sigma-gilt.vercel.app'
];

app.use(cors({
  origin: function (origin, callback) {
    // Permite requisições sem origin (ex: Postman, mobile apps)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      return callback(new Error('Not allowed by CORS'), false);
    }
    return callback(null, true);
  },
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

// Rotas de clientes
const clientesRoutes = require('./routes/clientes');
app.use('/api/clientes', clientesRoutes);

// Rotas de Notificações
const notificationsRoutes = require('./routes/notifications');
app.use('/api/notifications', notificationsRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
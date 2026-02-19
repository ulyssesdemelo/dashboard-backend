const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const authMiddleware = require('../middleware/auth');

// ROTA: Buscar total de clientes (rota protegida)
router.get('/count', authMiddleware, async (req, res) => {
  try {
    // Conta quantos clientes existem no banco
    const result = await pool.query('SELECT COUNT(*) FROM clientes');
    
    const totalClientes = parseInt(result.rows[0].count);

    res.json({ 
      total: totalClientes 
    });

  } catch (error) {
    console.error('Erro ao buscar clientes:', error);
    res.status(500).json({ error: 'Erro ao buscar clientes' });
  }
});

// ROTA: Listar todos os clientes (rota protegida)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, created_at FROM clientes ORDER BY created_at DESC'
    );

    res.json({ 
      clientes: result.rows 
    });

  } catch (error) {
    console.error('Erro ao listar clientes:', error);
    res.status(500).json({ error: 'Erro ao listar clientes' });
  }
});

module.exports = router;
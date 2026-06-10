const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const authMiddleware = require('../middleware/auth');

// ROTA: Contar total de clientes (para o card do dashboard)
router.get('/count', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query('SELECT COUNT(*) FROM clientes');
    const totalClientes = parseInt(result.rows[0].count);
    res.json({ total: totalClientes });
  } catch (error) {
    console.error('Erro ao contar clientes:', error);
    res.status(500).json({ error: 'Erro ao contar clientes' });
  }
});

// ROTA: Listar todos os clientes
router.get('/', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, nome, sobrenome, whatsapp, email, cpf, ativo, created_at
       FROM clientes
       ORDER BY created_at DESC`
    );
    res.json({ clientes: result.rows });
  } catch (error) {
    console.error('Erro ao listar clientes:', error);
    res.status(500).json({ error: 'Erro ao listar clientes' });
  }
});

// ROTA: Buscar um cliente específico (pelo id)
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT * FROM clientes WHERE id = $1',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }
    res.json({ cliente: result.rows[0] });
  } catch (error) {
    console.error('Erro ao buscar cliente:', error);
    res.status(500).json({ error: 'Erro ao buscar cliente' });
  }
});

// ROTA: Criar novo cliente
router.post('/', authMiddleware, async (req, res) => {
  try {
const {
      nome, sobrenome, whatsapp, email, cpf, data_nascimento,
      logradouro, numero, cidade, estado, cep, observacoes,
      passaporte_numero, passaporte_emissao, passaporte_vencimento,
      rg_cnh, visto_tipo, visto_vencimento, seguro_ativo, seguro_vencimento
    } = req.body;

    // Validação: nome e sobrenome são obrigatórios
    if (!nome || !sobrenome) {
      return res.status(400).json({ error: 'Nome e sobrenome são obrigatórios' });
    }

    // Validação: pelo menos um contato (whatsapp ou email)
    if (!whatsapp && !email) {
      return res.status(400).json({ error: 'Informe pelo menos WhatsApp ou e-mail' });
    }

const result = await pool.query(
      `INSERT INTO clientes
        (nome, sobrenome, whatsapp, email, cpf, data_nascimento,
         logradouro, numero, cidade, estado, cep, observacoes,
         passaporte_numero, passaporte_emissao, passaporte_vencimento,
         rg_cnh, visto_tipo, visto_vencimento, seguro_ativo, seguro_vencimento)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12,
               $13, $14, $15, $16, $17, $18, $19, $20)
       RETURNING *`,
      [nome, sobrenome, whatsapp || null, email || null, cpf || null,
       data_nascimento || null, logradouro || null, numero || null,
       cidade || null, estado || null, cep || null, observacoes || null,
       passaporte_numero || null, passaporte_emissao || null, passaporte_vencimento || null,
       rg_cnh || null, visto_tipo || null, visto_vencimento || null,
       seguro_ativo || false, seguro_vencimento || null]
    );

    res.status(201).json({
      message: 'Cliente criado com sucesso!',
      cliente: result.rows[0]
    });
  } catch (error) {
    // Erro de CPF duplicado (violação da regra UNIQUE)
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Este CPF já está cadastrado' });
    }
    console.error('Erro ao criar cliente:', error);
    res.status(500).json({ error: 'Erro ao criar cliente' });
  }
});

// ROTA: Atualizar cliente existente
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
const {
      nome, sobrenome, whatsapp, email, cpf, data_nascimento,
      logradouro, numero, cidade, estado, cep, ativo, observacoes,
      passaporte_numero, passaporte_emissao, passaporte_vencimento,
      rg_cnh, visto_tipo, visto_vencimento, seguro_ativo, seguro_vencimento
    } = req.body;

    if (!nome || !sobrenome) {
      return res.status(400).json({ error: 'Nome e sobrenome são obrigatórios' });
    }

const result = await pool.query(
      `UPDATE clientes SET
        nome = $1, sobrenome = $2, whatsapp = $3, email = $4, cpf = $5,
        data_nascimento = $6, logradouro = $7, numero = $8, cidade = $9,
        estado = $10, cep = $11, ativo = $12, observacoes = $13,
        passaporte_numero = $14, passaporte_emissao = $15, passaporte_vencimento = $16,
        rg_cnh = $17, visto_tipo = $18, visto_vencimento = $19,
        seguro_ativo = $20, seguro_vencimento = $21
       WHERE id = $22
       RETURNING *`,
      [nome, sobrenome, whatsapp || null, email || null, cpf || null,
       data_nascimento || null, logradouro || null, numero || null,
       cidade || null, estado || null, cep || null,
       ativo, observacoes || null,
       passaporte_numero || null, passaporte_emissao || null, passaporte_vencimento || null,
       rg_cnh || null, visto_tipo || null, visto_vencimento || null,
       seguro_ativo || false, seguro_vencimento || null, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }

    res.json({
      message: 'Cliente atualizado com sucesso!',
      cliente: result.rows[0]
    });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Este CPF já está cadastrado' });
    }
    console.error('Erro ao atualizar cliente:', error);
    res.status(500).json({ error: 'Erro ao atualizar cliente' });
  }
});

// ROTA: Deletar cliente
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'DELETE FROM clientes WHERE id = $1 RETURNING id',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }
    res.json({ message: 'Cliente removido com sucesso!' });
  } catch (error) {
    console.error('Erro ao deletar cliente:', error);
    res.status(500).json({ error: 'Erro ao deletar cliente' });
  }
});

module.exports = router;
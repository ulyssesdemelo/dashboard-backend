const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const admin = require('../config/firebase');
const authMiddleware = require('../middleware/auth');

// ROTA: Salvar token do dispositivo
router.post('/token', authMiddleware, async (req, res) => {
  try {
    const { token, deviceType } = req.body;
    const userId = req.userId;

    if (!token) {
      return res.status(400).json({ error: 'Token é obrigatório' });
    }

    // Verifica se o token já existe
    const exists = await pool.query(
      'SELECT * FROM device_tokens WHERE token = $1',
      [token]
    );

    if (exists.rows.length > 0) {
      // Atualiza o user_id se mudou
      await pool.query(
        'UPDATE device_tokens SET user_id = $1, device_type = $2 WHERE token = $3',
        [userId, deviceType, token]
      );
    } else {
      // Insere novo token
      await pool.query(
        'INSERT INTO device_tokens (user_id, token, device_type) VALUES ($1, $2, $3)',
        [userId, token, deviceType]
      );
    }

    res.json({ 
      success: true,
      message: 'Token salvo com sucesso' 
    });

  } catch (error) {
    console.error('Erro ao salvar token:', error);
    res.status(500).json({ error: 'Erro ao salvar token' });
  }
});

// ROTA: Enviar notificação para um usuário específico
router.post('/send', authMiddleware, async (req, res) => {
  try {
    const { userId, title, body } = req.body;

    if (!userId || !title || !body) {
      return res.status(400).json({ 
        error: 'userId, title e body são obrigatórios' 
      });
    }

    // Buscar tokens do usuário
    const result = await pool.query(
      'SELECT token FROM device_tokens WHERE user_id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        error: 'Nenhum dispositivo encontrado para este usuário' 
      });
    }

    const tokens = result.rows.map(row => row.token);

    // Enviar notificação via Firebase
    const message = {
      notification: {
        title: title,
        body: body,
      },
      tokens: tokens,
    };

    const response = await admin.messaging().sendEachForMulticast(message);

    res.json({
      success: true,
      successCount: response.successCount,
      failureCount: response.failureCount,
      message: `Notificação enviada para ${response.successCount} dispositivo(s)`
    });

  } catch (error) {
    console.error('Erro ao enviar notificação:', error);
    res.status(500).json({ error: 'Erro ao enviar notificação' });
  }
});

// ROTA: Enviar notificação para TODOS os usuários
router.post('/send-all', authMiddleware, async (req, res) => {
  try {
    const { title, body } = req.body;

    if (!title || !body) {
      return res.status(400).json({ 
        error: 'title e body são obrigatórios' 
      });
    }

    // Buscar TODOS os tokens
    const result = await pool.query('SELECT token FROM device_tokens');

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        error: 'Nenhum dispositivo cadastrado' 
      });
    }

    const tokens = result.rows.map(row => row.token);

    // Enviar notificação via Firebase
    const message = {
      notification: {
        title: title,
        body: body,
      },
      tokens: tokens,
    };

    const response = await admin.messaging().sendEachForMulticast(message);

    res.json({
      success: true,
      successCount: response.successCount,
      failureCount: response.failureCount,
      message: `Notificação enviada para ${response.successCount} dispositivo(s)`
    });

  } catch (error) {
    console.error('Erro ao enviar notificação:', error);
    res.status(500).json({ error: 'Erro ao enviar notificação' });
  }
});

// ROTA: Listar usuários com dispositivos cadastrados
router.get('/users', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT DISTINCT u.id, u.name, u.email, 
             COUNT(dt.id) as device_count
      FROM users u
      INNER JOIN device_tokens dt ON u.id = dt.user_id
      GROUP BY u.id, u.name, u.email
      ORDER BY u.name
    `);

    res.json({ users: result.rows });

  } catch (error) {
    console.error('Erro ao listar usuários:', error);
    res.status(500).json({ error: 'Erro ao listar usuários' });
  }
});

module.exports = router;
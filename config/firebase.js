const admin = require('firebase-admin');

// Em produção (Railway), lê de variável de ambiente
// Em desenvolvimento, lê do arquivo local
let serviceAccount;

if (process.env.FIREBASE_CREDENTIALS) {
  // Produção - Railway
  try {
    serviceAccount = JSON.parse(process.env.FIREBASE_CREDENTIALS);
    console.log('✅ Credenciais Firebase carregadas de variável de ambiente');
  } catch (error) {
    console.error('❌ Erro ao parsear FIREBASE_CREDENTIALS:', error.message);
    process.exit(1);
  }
} else {
  // Desenvolvimento - Local
  try {
    serviceAccount = require('./firebase-credentials.json');
    console.log('✅ Credenciais Firebase carregadas do arquivo local');
  } catch (error) {
    console.error('❌ Arquivo firebase-credentials.json não encontrado!');
    process.exit(1);
  }
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;
const mysql = require('mysql2');
require('dotenv').config();

// Criar pool de conexões
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'fastcomanda',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  decimalNumbers: true,
});

// Usar promises
const promisePool = pool.promise();

// Testar conexão
pool.getConnection((err, connection) => {
  if (err) {
    console.error('❌ Erro ao conectar ao MySQL:', err.message);
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
      console.error('Conexão com o banco foi perdida.');
    }
    if (err.code === 'ER_CON_COUNT_ERROR') {
      console.error('Muitas conexões ao banco de dados.');
    }
    if (err.code === 'ECONNREFUSED') {
      console.error('Conexão recusada. Verifique se o MySQL está rodando.');
    }
  } else {
    console.log('✅ Conectado ao MySQL com sucesso!');
    connection.release();
  }
});

module.exports = promisePool;

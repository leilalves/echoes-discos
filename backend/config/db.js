// ============================================================
// config/db.js — Pool de conexões com o banco MySQL
// Utiliza mysql2/promise para suporte a async/await.
// As credenciais vêm do arquivo .env (nunca hardcoded).
// ============================================================

require('dotenv').config();
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host:               process.env.DB_HOST,
    user:               process.env.DB_USER,
    password:           process.env.DB_PASSWORD,
    database:           process.env.DB_NAME,
    port:               process.env.DB_PORT || 3306,
    multipleStatements: true,
    waitForConnections: true,   // aguarda conexão livre se o pool estiver cheio
    connectionLimit:    10,     // máximo de conexões simultâneas
    queueLimit:         0       // sem limite de fila
});

module.exports = pool;

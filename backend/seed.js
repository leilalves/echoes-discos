// ============================================================
// seed.js — Cria os usuários iniciais do sistema
//
// Execute UMA VEZ após criar o banco:
//   node seed.js
// ============================================================

require('dotenv').config();
const bcrypt = require('bcrypt');
const pool   = require('./config/db');

const usuarios = [
    { username: 'admin',   password: 'admin123', role: 'admin'   },
    { username: 'usuario', password: 'user123',  role: 'usuario' }
];

async function seed() {
    console.log('\n🌱  Criando usuários iniciais...\n');

    for (const u of usuarios) {
        const hash = await bcrypt.hash(u.password, 10);
        await pool.execute(
            `INSERT INTO usuarios (username, password, role)
             VALUES (?, ?, ?)
             ON DUPLICATE KEY UPDATE password = VALUES(password), role = VALUES(role)`,
            [u.username, hash, u.role]
        );
        console.log(`✅  ${u.username.padEnd(10)} (${u.role})`);
    }

    console.log('\n✅  Seed concluído!\n');
    console.log('─────────────────────────────────────');
    console.log('👤  admin   / admin123  → acesso total ao painel');
    console.log('👤  usuario / user123   → visualização do catálogo');
    console.log('─────────────────────────────────────\n');
    process.exit(0);
}

seed().catch(e => {
    console.error('❌  Erro no seed:', e.message);
    process.exit(1);
});

// ============================================================
// models/Usuario.js — Model que representa um usuário do sistema
//
// Perfis:
//   • admin   → acesso total ao painel (CRUD, estoque, pedidos)
//   • usuario → acesso de visualização (catálogo, destaques)
//
// Senhas são sempre armazenadas como hash bcrypt.
// ============================================================

const db     = require('../config/db');
const bcrypt = require('bcrypt');

class Usuario {

    constructor(id, username, role) {
        this.id       = id;
        this.username = username;
        this.role     = role; // 'admin' ou 'usuario'
    }

    // ── MÉTODOS DE INSTÂNCIA ──────────────────────────────────

    /** Retorna true se o usuário for administrador */
    isAdmin() {
        return this.role === 'admin';
    }

    /** Resumo em string — útil para logs */
    exibirInfo() {
        return `Usuário: ${this.username} | Perfil: ${this.role}`;
    }

    // ── MÉTODOS ESTÁTICOS ─────────────────────────────────────

    /**
     * Verifica credenciais e retorna instância de Usuario ou null.
     * Usa bcrypt.compare para verificar o hash salvo no banco.
     */
    static async autenticar(username, senhaDigitada) {
        const [rows] = await db.execute(
            'SELECT * FROM usuarios WHERE username = ?', [username]
        );
        if (rows.length === 0) return null;

        const u  = rows[0];
        const ok = await bcrypt.compare(senhaDigitada, u.password);

        return ok ? new Usuario(u.id, u.username, u.role) : null;
    }

    /**
     * Lista todos os usuários (sem expor as senhas).
     */
    static async listarTodos() {
        const [rows] = await db.execute(
            'SELECT id, username, role, criado_em FROM usuarios ORDER BY id'
        );
        return rows;
    }

    /**
     * Cria um novo usuário com senha hasheada.
     */
    static async criar(username, senha, role) {
        const hash = await bcrypt.hash(senha, 10);
        const [resultado] = await db.execute(
            'INSERT INTO usuarios (username, password, role) VALUES (?, ?, ?)',
            [username, hash, role]
        );
        return resultado.insertId;
    }

    /**
     * Atualiza a senha de um usuário (sempre rehasheia).
     */
    static async alterarSenha(id, novaSenha) {
        const hash = await bcrypt.hash(novaSenha, 10);
        await db.execute(
            'UPDATE usuarios SET password=? WHERE id=?', [hash, id]
        );
    }
}

module.exports = Usuario;

// ============================================================
// routes/api.js — Todas as rotas da API REST
//
// Convenção de acesso:
//   Público      → sem middleware (qualquer visitante)
//   Autenticado  → autenticado (qualquer usuário logado)
//   Admin        → autenticado + apenasAdmin
// ============================================================

const express = require('express');
const router  = express.Router();

const AuthController   = require('../controllers/AuthController');
const DiscoController  = require('../controllers/DiscoController');
const PedidoController = require('../controllers/PedidoController');

const { autenticado, apenasAdmin }  = require('../middleware/auth');
const { uploadComTratamento }       = require('../config/upload');

// ── AUTENTICAÇÃO ──────────────────────────────────────────────
router.post('/login',  AuthController.login);
router.post('/logout', autenticado, AuthController.logout);
router.get('/sessao',  autenticado, AuthController.verificarSessao);

// ── ROTAS PÚBLICAS (sem login) ────────────────────────────────
// Catálogo visível no site — apenas discos Disponíveis
router.get('/public/discos',    DiscoController.listarPublico);
// Destaques para o carrossel "Em Alta"
router.get('/public/destaques', DiscoController.listarDestaques);
router.get('/public/discos/todos', DiscoController.listar);

// ── ROTAS PARA QUALQUER USUÁRIO LOGADO ───────────────────────
// Usuário comum pode ver o catálogo completo (inclusive indisponíveis)
router.get('/discos',     autenticado, DiscoController.listar);
router.get('/discos/:id', autenticado, DiscoController.buscarUm);

// ── ROTAS PRIVADAS DE ESCRITA (somente admin) ─────────────────
router.post('/discos',
    autenticado, apenasAdmin,
    uploadComTratamento('imagem'),
    DiscoController.adicionar);

router.put('/discos/:id',
    autenticado, apenasAdmin,
    uploadComTratamento('imagem'),
    DiscoController.editar);

router.put('/discos/:id/status',
    autenticado, apenasAdmin,
    DiscoController.alterarStatus);

router.delete('/discos/:id',
    autenticado, apenasAdmin,
    DiscoController.deletar);

// ── PAINEL ADMIN — estatísticas e pedidos ─────────────────────
router.get('/admin/estatisticas',   autenticado, apenasAdmin, DiscoController.estatisticas);
router.get('/admin/pedidos',        autenticado, apenasAdmin, PedidoController.listar);
router.get('/admin/pedidos/stats',  autenticado, apenasAdmin, PedidoController.estatisticas);

module.exports = router;

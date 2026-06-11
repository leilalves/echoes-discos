// ============================================================
// server.js — Servidor principal Express da Echoes Discos
// ============================================================

require('dotenv').config();

const express = require('express');
const session = require('express-session');
const cors    = require('cors');
const path    = require('path');

const apiRoutes = require('./routes/api');

const app  = express();
const PORT = process.env.PORT || 3000;

// ── CORS ──────────────────────────────────────────────────────
app.use(cors({ origin: `http://localhost:${PORT}`, credentials: true }));

// ── Parsers ───────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Sessão ────────────────────────────────────────────────────
app.use(session({
    secret:            process.env.SESSION_SECRET || 'echoes_secret',
    resave:            false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure:   false,
        maxAge:   1000 * 60 * 60 * 8  // 8 horas
    }
}));

// ── Estáticos — rotas específicas (sem servir index.html automático)
app.use('/css',     express.static(path.join(__dirname, '../frontend/css')));
app.use('/assets',  express.static(path.join(__dirname, '../frontend/assets')));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ── Rotas da API ──────────────────────────────────────────────
app.use('/api', apiRoutes);

// ── Rotas das páginas HTML ────────────────────────────────────
app.get('/',          (req, res) => res.sendFile(path.join(__dirname, '../frontend/views/index.html')));
app.get('/login',     (req, res) => res.sendFile(path.join(__dirname, '../frontend/views/login.html')));
app.get('/dashboard', (req, res) => res.sendFile(path.join(__dirname, '../frontend/views/dashboard.html')));
app.get('/painel',    (req, res) => res.sendFile(path.join(__dirname, '../frontend/views/painel-usuario.html')));

// ── Handler global de erros ───────────────────────────────────
app.use((err, req, res, next) => {
    console.error('Erro não tratado:', err.message);
    if (res.headersSent) return next(err);
    res.status(err.status || 500).json({
        erro: err.message || 'Erro interno no servidor.'
    });
});

// ── Iniciar servidor ──────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`\n🎵  ECHOES DISCOS — Servidor iniciado\n`);
    console.log(`🌐  Site público:    http://localhost:${PORT}/`);
    console.log(`🔐  Login:           http://localhost:${PORT}/login`);
    console.log(`🛠️   Dashboard Admin: http://localhost:${PORT}/dashboard`);
    console.log(`👤  Painel Usuário:  http://localhost:${PORT}/painel\n`);
});
require('dotenv').config();

const express = require('express');
const session = require('express-session');
const cors    = require('cors');
const path    = require('path');

const apiRoutes = require('./routes/api');
const bdBanco   = require('./config/db'); // 👈 Garanta que este caminho aponta para o seu arquivo de conexão pool

const app  = express();
const PORT = process.env.PORT || 3000;

// ── CORS (Liberado para produção no Render) ─────────────────────
app.use(cors({ 
    origin: true, // Permite que o próprio Render se comunique internamente sem travar no localhost
    credentials: true 
}));

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

// ── Estáticos — rotas específicas ──────────────────────────────
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

// ── Automação do Banco de Dados (Cria tudo sozinho no Railway) ─
async function inicializarBanco() {
    try {
        console.log("⏳ Checando/Criando tabelas no Railway automaticamente...");
        
        const sqlSetup = `
        CREATE TABLE IF NOT EXISTS usuarios (
            id         INT AUTO_INCREMENT PRIMARY KEY,
            username   VARCHAR(50)  NOT NULL UNIQUE,
            password   VARCHAR(255) NOT NULL,
            role       ENUM('admin','usuario') NOT NULL,
            criado_em  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS discos (
            id          INT AUTO_INCREMENT PRIMARY KEY,
            album       VARCHAR(150)  NOT NULL,
            artista     VARCHAR(100)  NOT NULL,
            generos     VARCHAR(200)  NOT NULL,          
            descricao   TEXT          NOT NULL,
            preco       DECIMAL(8,2)  NOT NULL,
            quantidade  INT           NOT NULL DEFAULT 0, 
            status      ENUM('Disponível','Indisponível') DEFAULT 'Disponível',
            imagem      VARCHAR(255)  DEFAULT NULL,       
            destaque    TINYINT(1)    DEFAULT 0,          
            cor_fundo   VARCHAR(7)    DEFAULT '#1a1a1a',  
            criado_em   TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS pedidos (
            id          INT AUTO_INCREMENT PRIMARY KEY,
            cliente     VARCHAR(100) NOT NULL,
            email       VARCHAR(150) NOT NULL,
            total       DECIMAL(8,2) NOT NULL,
            criado_em   TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
        );
        `;
        
        await bdBanco.query(sqlSetup);

        // Verifica se a tabela de discos está vazia para não duplicar os dados
        const [linhas] = await bdBanco.query("SELECT COUNT(*) as total FROM discos");
        if (linhas[0].total === 0) {
            console.log("📦 Banco de dados vazio! Inserindo discos padrão...");
            const sqlInserts = `
            INSERT INTO discos (album, artista, generos, descricao, preco, quantidade, status, imagem, destaque, cor_fundo) VALUES
            ('Live Through This', 'Hole', 'grunge/alt rock/punk rock', 'Álbum icônico de 1994 que consolidou Hole...', 170.00, 33, 'Disponível', 'hole.png', 0, '#1a0000'),
            ('Jar of Flies', 'Alice in Chains', 'grunge/alt rock/hard rock/rock', 'EP acústico lançado em 1994...', 290.00, 15, 'Disponível', 'alice.png', 1, '#0d1a00'),
            ('Etazhi', 'Molchat Doma', 'synth pop/dark wave/new wave', 'Segundo álbum da banda bielorrussa...', 250.00, 38, 'Disponível', 'molchat.png', 1, '#003459');
            `;
            await bdBanco.query(sqlInserts);
        }
        console.log("✅ Banco de dados sincronizado perfeitamente com o Railway!");
    } catch (erro) {
        console.error("❌ Erro ao inicializar o banco pelo Node:", erro.message);
    }
}

// ── Handler global de erros ───────────────────────────────────
app.use((err, req, res, next) => {
    console.error('Erro não tratado:', err.message);
    if (res.headersSent) return next(err);
    res.status(err.status || 500).json({
        erro: err.message || 'Erro interno no servidor.'
    });
});

// ── Iniciar servidor ──────────────────────────────────────────
app.listen(PORT, async () => {
    console.log(`\n🎵  ECHOES DISCOS — Servidor iniciado na porta ${PORT}\n`);
    // Inicializa as tabelas na nuvem assim que o servidor ligar
    await inicializarBanco();
});
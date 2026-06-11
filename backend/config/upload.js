// ============================================================
// config/upload.js — Configuração do Multer para upload de capas
//
// Aceita: JPG, PNG, WEBP (até 5 MB)
// Destino: pasta /uploads/ na raiz do projeto
// Nome:    timestamp + random para evitar colisões
// ============================================================

const multer = require('multer');
const path   = require('path');
const fs     = require('fs');

// --- Armazenamento em disco ---
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Garante que a pasta uploads/ existe antes de salvar
        const uploadPath = path.join(__dirname, '../../uploads');
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        // Ex: 1716900000000-847362819.jpg
        const ext    = path.extname(file.originalname).toLowerCase();
        const unique = Date.now() + '-' + Math.round(Math.random() * 1e9) + ext;
        cb(null, unique);
    }
});

// --- Filtro de tipos permitidos ---
const fileFilter = (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (allowed.includes(file.mimetype)) {
        cb(null, true);
    } else {
        // Não lança exceção — o controller verifica req.fileValidationError
        req.fileValidationError = 'Formato inválido. Envie apenas JPG, PNG ou WEBP.';
        cb(null, false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5 MB
});

// ── Wrapper que captura erros do Multer (ex: arquivo > 5 MB)
// e retorna JSON limpo em vez de travar a requisição.
// Necessário no Express 5, que não faz repasse automático de erros
// de middleware de terceiros para o handler da rota.
function uploadComTratamento(campo) {
    return function (req, res, next) {
        upload.single(campo)(req, res, function (err) {
            if (err) {
                const msg = err.code === 'LIMIT_FILE_SIZE'
                    ? 'Arquivo muito grande. Máximo: 5 MB.'
                    : err.message || 'Erro no upload.';
                return res.status(400).json({ erro: msg });
            }
            next();
        });
    };
}

module.exports = { uploadComTratamento };

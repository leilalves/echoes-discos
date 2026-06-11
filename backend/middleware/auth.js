// ============================================================
// middleware/auth.js — Proteção de rotas por sessão e perfil
//
// autenticado  → qualquer usuário logado (admin ou usuario)
// apenasAdmin  → somente perfil 'admin'
// ============================================================

/**
 * Verifica se existe uma sessão ativa.
 * Retorna 401 se o usuário não estiver logado.
 */
function autenticado(req, res, next) {
    if (req.session && req.session.usuario) {
        return next();
    }
    return res.status(401).json({ erro: 'Acesso negado. Faça login primeiro.' });
}

/**
 * Verifica se o usuário logado é administrador.
 * Deve ser usado APÓS o middleware autenticado.
 * Retorna 403 se o perfil não for 'admin'.
 */
function apenasAdmin(req, res, next) {
    if (req.session.usuario && req.session.usuario.role === 'admin') {
        return next();
    }
    return res.status(403).json({ erro: 'Acesso proibido. Apenas administradores.' });
}

module.exports = { autenticado, apenasAdmin };

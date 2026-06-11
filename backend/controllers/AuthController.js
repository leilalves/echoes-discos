// ============================================================
// controllers/AuthController.js — Login, Logout e Sessão
// ============================================================

const Usuario = require('../models/Usuario');

class AuthController {

    // --------------------------------------------------------
    // login() — POST /api/login
    // Autentica o usuário e cria a sessão.
    // Redireciona admin para /dashboard e usuário para /painel.
    // --------------------------------------------------------
    static async login(req, res) {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: 'Informe usuário e senha.'
            });
        }

        try {
            const usuario = await Usuario.autenticar(username, password);

            if (usuario) {
                // Salva dados mínimos na sessão (nunca a senha)
                req.session.usuario = {
                    id:       usuario.id,
                    username: usuario.username,
                    role:     usuario.role
                };

                // Destino depende do perfil
                const redirectTo = usuario.isAdmin() ? '/dashboard' : '/painel';

                return res.status(200).json({
                    success: true,
                    user: req.session.usuario,
                    redirectTo
                });
            }

            return res.status(401).json({
                success: false,
                message: 'Usuário ou senha incorretos.'
            });

        } catch (erro) {
            console.error('Erro no login:', erro);
            return res.status(500).json({
                success: false,
                message: 'Erro interno no servidor.'
            });
        }
    }

    // --------------------------------------------------------
    // logout() — POST /api/logout
    // Destrói a sessão e limpa o cookie.
    // --------------------------------------------------------
    static logout(req, res) {
        req.session.destroy((erro) => {
            if (erro) {
                return res.status(500).json({
                    success: false,
                    message: 'Erro ao encerrar sessão.'
                });
            }
            res.clearCookie('connect.sid');
            return res.json({ success: true, message: 'Logout realizado.' });
        });
    }

    // --------------------------------------------------------
    // verificarSessao() — GET /api/sessao
    // Retorna os dados do usuário logado.
    // Usado pelo frontend para verificar se a sessão ainda vale.
    // --------------------------------------------------------
    static verificarSessao(req, res) {
        return res.json({
            success: true,
            user: req.session.usuario
        });
    }
}

module.exports = AuthController;

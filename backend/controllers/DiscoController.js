// ============================================================
// controllers/DiscoController.js
// Gerencia todas as requisições relacionadas a discos:
//   • Listagem pública (vitrine e destaques)
//   • CRUD completo para admins
//   • Alternância de disponibilidade e destaque
//   • Estatísticas para o painel
// ============================================================

const Disco = require('../models/Disco');

class DiscoController {

    // --------------------------------------------------------
    // listarPublico() — GET /api/public/discos
    // Rota pública — retorna apenas discos DISPONÍVEIS.
    // Usada pelo catálogo no index.html (sem login).
    // --------------------------------------------------------
    static async listarPublico(req, res) {
        try {
            const discos = await Disco.listarDisponiveis();
            return res.json(discos);
        } catch (erro) {
            console.error('Erro ao listar discos públicos:', erro);
            return res.status(500).json({ erro: 'Erro ao carregar catálogo.' });
        }
    }

    // --------------------------------------------------------
    // listarDestaques() — GET /api/public/destaques
    // Rota pública — retorna discos em destaque para o carrossel.
    // --------------------------------------------------------
    static async listarDestaques(req, res) {
        try {
            const destaques = await Disco.listarDestaques();
            return res.json(destaques);
        } catch (erro) {
            console.error('Erro ao listar destaques:', erro);
            return res.status(500).json({ erro: 'Erro ao carregar destaques.' });
        }
    }

    // --------------------------------------------------------
    // listar() — GET /api/discos
    // Rota privada (autenticado) — retorna TODOS os discos.
    // Admins veem tudo; usuários comuns também podem listar.
    // --------------------------------------------------------
    static async listar(req, res) {
        try {
            const discos = await Disco.listarTodos();
            return res.json(discos);
        } catch (erro) {
            console.error('Erro ao listar discos:', erro);
            return res.status(500).json({ erro: 'Erro ao listar discos.' });
        }
    }

    // --------------------------------------------------------
    // buscarUm() — GET /api/discos/:id
    // Busca um disco pelo ID para preencher o modal de edição.
    // --------------------------------------------------------
    static async buscarUm(req, res) {
        try {
            const disco = await Disco.buscarPorId(req.params.id);
            if (!disco) {
                return res.status(404).json({ erro: 'Disco não encontrado.' });
            }
            console.log('Disco buscado:', disco.exibirResumo());
            return res.json(disco);
        } catch (erro) {
            console.error('Erro ao buscar disco:', erro);
            return res.status(500).json({ erro: 'Erro ao buscar disco.' });
        }
    }

    // --------------------------------------------------------
    // adicionar() — POST /api/discos
    // Cadastra novo disco. Aceita upload de capa OU URL externa.
    // --------------------------------------------------------
    static async adicionar(req, res) {
        const { album, artista, generos, descricao, preco, quantidade,
                status, imagemUrl, destaque, cor_fundo } = req.body;

        // Erro de validação de tipo de arquivo (setado pelo multer)
        if (req.fileValidationError) {
            return res.status(400).json({ erro: req.fileValidationError });
        }

        // Prioridade: arquivo enviado > URL > null
        const imagem = req.file ? req.file.filename : (imagemUrl || null);

        // Validação dos campos obrigatórios
        if (!album || !artista || !generos || !descricao || !preco || !status) {
            return res.status(400).json({ erro: 'Preencha todos os campos obrigatórios.' });
        }
        if (Number(preco) < 0) {
            return res.status(400).json({ erro: 'O preço não pode ser negativo.' });
        }
        if (Number(quantidade) < 0) {
            return res.status(400).json({ erro: 'A quantidade não pode ser negativa.' });
        }

        try {
            const novoId = await Disco.adicionar(
                album, artista, generos, descricao, preco,
                quantidade || 0, status, imagem,
                destaque === '1' || destaque === true ? 1 : 0,
                cor_fundo || '#1a1a1a'
            );
            return res.status(201).json({ mensagem: 'Disco cadastrado com sucesso!', id: novoId });
        } catch (erro) {
            console.error('Erro ao adicionar disco:', erro);
            return res.status(500).json({ erro: 'Erro ao cadastrar disco.' });
        }
    }

    // --------------------------------------------------------
    // editar() — PUT /api/discos/:id
    // Atualiza disco existente. Nova imagem é opcional.
    // --------------------------------------------------------
    static async editar(req, res) {
        const id = req.params.id;
        const { album, artista, generos, descricao, preco, quantidade,
                status, imagemUrl, destaque, cor_fundo } = req.body;

        if (req.fileValidationError) {
            return res.status(400).json({ erro: req.fileValidationError });
        }

        const imagem = req.file ? req.file.filename : (imagemUrl || null);

        if (!album || !artista || !generos || !descricao || !preco || !status) {
            return res.status(400).json({ erro: 'Preencha todos os campos obrigatórios.' });
        }
        if (Number(preco) < 0) {
            return res.status(400).json({ erro: 'O preço não pode ser negativo.' });
        }

        try {
            await Disco.editar(
                id, album, artista, generos, descricao, preco,
                quantidade || 0, status, imagem,
                destaque === '1' || destaque === true ? 1 : 0,
                cor_fundo || '#1a1a1a'
            );
            return res.json({ mensagem: 'Disco atualizado com sucesso!' });
        } catch (erro) {
            console.error('Erro ao editar disco:', erro);
            return res.status(500).json({ erro: 'Erro ao atualizar disco.' });
        }
    }

    // --------------------------------------------------------
    // alterarStatus() — PUT /api/discos/:id/status
    // Alterna Disponível ↔ Indisponível.
    // --------------------------------------------------------
    static async alterarStatus(req, res) {
        try {
            const disco = await Disco.buscarPorId(req.params.id);
            if (!disco) return res.status(404).json({ erro: 'Disco não encontrado.' });

            const novoStatus = disco.estaDisponivel() ? 'Indisponível' : 'Disponível';
            await Disco.alterarStatus(req.params.id, novoStatus);

            return res.json({ mensagem: `Disco marcado como ${novoStatus}!`, status: novoStatus });
        } catch (erro) {
            console.error('Erro ao alterar status:', erro);
            return res.status(500).json({ erro: 'Erro ao alterar status.' });
        }
    }

    // --------------------------------------------------------
    // deletar() — DELETE /api/discos/:id
    // Remove permanentemente um disco.
    // --------------------------------------------------------
    static async deletar(req, res) {
        try {
            await Disco.deletar(req.params.id);
            return res.json({ mensagem: 'Disco removido com sucesso.' });
        } catch (erro) {
            console.error('Erro ao deletar disco:', erro);
            return res.status(500).json({ erro: 'Erro ao remover disco.' });
        }
    }

    // --------------------------------------------------------
    // estatisticas() — GET /api/admin/estatisticas
    // Retorna totais para os cards do painel admin.
    // --------------------------------------------------------
    static async estatisticas(req, res) {
        try {
            const stats = await Disco.estatisticas();
            return res.json(stats);
        } catch (erro) {
            console.error('Erro ao buscar estatísticas:', erro);
            return res.status(500).json({ erro: 'Erro ao buscar estatísticas.' });
        }
    }
}

module.exports = DiscoController;

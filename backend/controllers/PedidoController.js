// ============================================================
// controllers/PedidoController.js
// Gerencia o histórico de pedidos.
// ============================================================

const Pedido = require('../models/Pedido');

class PedidoController {

    // --------------------------------------------------------
    // listar() — GET /api/admin/pedidos
    // Retorna todos os pedidos com itens (somente admin).
    // --------------------------------------------------------
    static async listar(req, res) {
        try {
            const pedidos = await Pedido.listarTodos();
            return res.json(pedidos);
        } catch (erro) {
            console.error('Erro ao listar pedidos:', erro);
            return res.status(500).json({ erro: 'Erro ao listar pedidos.' });
        }
    }

    // --------------------------------------------------------
    // estatisticas() — GET /api/admin/pedidos/stats
    // Retorna totais de vendas para o painel.
    // --------------------------------------------------------
    static async estatisticas(req, res) {
        try {
            const stats = await Pedido.estatisticas();
            return res.json(stats);
        } catch (erro) {
            console.error('Erro ao buscar stats de pedidos:', erro);
            return res.status(500).json({ erro: 'Erro ao buscar estatísticas de pedidos.' });
        }
    }
}

module.exports = PedidoController;

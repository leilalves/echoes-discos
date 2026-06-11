// ============================================================
// models/Pedido.js — Model para o histórico de compras
// ============================================================

const db = require('../config/db');

class Pedido {

    constructor(id, cliente, email, total, criado_em, itens = []) {
        this.id        = id;
        this.cliente   = cliente;
        this.email     = email;
        this.total     = total;
        this.criado_em = criado_em;
        this.itens     = itens; // array de { album, artista, quantidade, preco_unit }
    }

    /** Formata o total no padrão brasileiro */
    totalFormatado() {
        return `R$ ${parseFloat(this.total).toFixed(2).replace('.', ',')}`;
    }

    // ── MÉTODOS ESTÁTICOS ─────────────────────────────────────

    /**
     * Retorna todos os pedidos com seus itens (JOIN).
     * Ordena por data decrescente.
     */
    static async listarTodos() {
        // Busca pedidos
        const [pedidos] = await db.execute(
            'SELECT * FROM pedidos ORDER BY criado_em DESC'
        );

        // Para cada pedido, busca os itens
        for (const p of pedidos) {
            const [itens] = await db.execute(
                `SELECT pi.quantidade, pi.preco_unit, d.album, d.artista
                 FROM pedido_itens pi
                 JOIN discos d ON d.id = pi.disco_id
                 WHERE pi.pedido_id = ?`,
                [p.id]
            );
            p.itens = itens;
        }

        return pedidos;
    }

    /**
     * Busca um pedido pelo ID com seus itens.
     */
    static async buscarPorId(id) {
        const [rows] = await db.execute('SELECT * FROM pedidos WHERE id = ?', [id]);
        if (rows.length === 0) return null;
        const p = rows[0];
        const [itens] = await db.execute(
            `SELECT pi.quantidade, pi.preco_unit, d.album, d.artista
             FROM pedido_itens pi
             JOIN discos d ON d.id = pi.disco_id
             WHERE pi.pedido_id = ?`,
            [id]
        );
        return new Pedido(p.id, p.cliente, p.email, p.total, p.criado_em, itens);
    }

    /**
     * Insere um pedido e seus itens em transação.
     * itens: [{ disco_id, quantidade, preco_unit }]
     */
    static async criar(cliente, email, total, itens) {
        const conn = await db.getConnection();
        try {
            await conn.beginTransaction();

            const [resultado] = await conn.execute(
                'INSERT INTO pedidos (cliente, email, total) VALUES (?, ?, ?)',
                [cliente, email, total]
            );
            const pedidoId = resultado.insertId;

            for (const item of itens) {
                await conn.execute(
                    'INSERT INTO pedido_itens (pedido_id, disco_id, quantidade, preco_unit) VALUES (?, ?, ?, ?)',
                    [pedidoId, item.disco_id, item.quantidade, item.preco_unit]
                );
                // Desconta do estoque
                await conn.execute(
                    'UPDATE discos SET quantidade = quantidade - ? WHERE id = ?',
                    [item.quantidade, item.disco_id]
                );
            }

            await conn.commit();
            return pedidoId;
        } catch (err) {
            await conn.rollback();
            throw err;
        } finally {
            conn.release();
        }
    }

    /**
     * Estatísticas de vendas para o painel.
     */
    static async estatisticas() {
        const [[total]]    = await db.execute('SELECT COUNT(*) AS total FROM pedidos');
        const [[receita]]  = await db.execute('SELECT SUM(total) AS total FROM pedidos');
        const [[ticketMed]]= await db.execute('SELECT AVG(total) AS total FROM pedidos');

        return {
            totalPedidos: total.total,
            receitaTotal: receita.total || 0,
            ticketMedio:  ticketMed.total || 0
        };
    }
}

module.exports = Pedido;

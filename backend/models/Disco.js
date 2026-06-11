// ============================================================
// models/Disco.js — Model que representa um disco de vinil
//
// Responsabilidades:
//   • Encapsular os dados de um disco
//   • Fornecer métodos de instância para lógica de negócio
//   • Fornecer métodos estáticos para CRUD no banco de dados
// ============================================================

const db = require('../config/db');

class Disco {

    // --- Construtor ---
    constructor(id, album, artista, generos, descricao, preco, quantidade,
                status, imagem, destaque, cor_fundo, criado_em) {
        this.id         = id;
        this.album      = album;
        this.artista    = artista;
        this.generos    = generos;
        this.descricao  = descricao;
        this.preco      = preco;          // DECIMAL(8,2)
        this.quantidade = quantidade;     // estoque
        this.status     = status;         // 'Disponível' ou 'Indisponível'
        this.imagem     = imagem;         // nome do arquivo ou URL externa
        this.destaque   = destaque;       // 1 = aparece no carrossel "Em Alta"
        this.cor_fundo  = cor_fundo;      // cor hex para o slide do carrossel
        this.criado_em  = criado_em;
    }

    // ── MÉTODOS DE INSTÂNCIA ──────────────────────────────────

    /** Retorna true se o disco estiver disponível para venda */
    estaDisponivel() {
        return this.status === 'Disponível';
    }

    /** Retorna true se estiver em destaque no carrossel */
    estaEmDestaque() {
        return this.destaque === 1 || this.destaque === true;
    }

    /** Formata o preço no padrão brasileiro */
    precoFormatado() {
        return `R$ ${parseFloat(this.preco).toFixed(2).replace('.', ',')}`;
    }

    /** Resumo em string — útil para logs */
    exibirResumo() {
        return `[${this.artista}] ${this.album} — ${this.precoFormatado()} — ${this.status} — Estoque: ${this.quantidade}`;
    }

    // ── MÉTODOS ESTÁTICOS (acesso ao banco) ──────────────────

    /**
     * Retorna todos os discos (para o painel admin).
     * Ordena por id DESC (mais recentes primeiro).
     */
    static async listarTodos() {
        const [rows] = await db.execute('SELECT * FROM discos ORDER BY id DESC');
        return rows;
    }

    /**
     * Retorna apenas discos com status = 'Disponível' (vitrine pública).
     * Ordena por artista e álbum.
     */
    static async listarDisponiveis() {
        const [rows] = await db.execute(
            "SELECT * FROM discos WHERE status = 'Disponível' ORDER BY artista, album"
        );
        return rows;
    }

    /**
     * Retorna os discos em destaque (carrossel "Em Alta").
     * Apenas os disponíveis aparecem no carrossel.
     */
    static async listarDestaques() {
        const [rows] = await db.execute(
            "SELECT * FROM discos WHERE destaque = 1 AND status = 'Disponível' ORDER BY id DESC LIMIT 6"
        );
        return rows;
    }

    /**
     * Busca um disco pelo ID.
     * Retorna instância de Disco ou null se não encontrado.
     */
    static async buscarPorId(id) {
        const [rows] = await db.execute('SELECT * FROM discos WHERE id = ?', [id]);
        if (rows.length === 0) return null;
        const d = rows[0];
        return new Disco(
            d.id, d.album, d.artista, d.generos, d.descricao,
            d.preco, d.quantidade, d.status, d.imagem,
            d.destaque, d.cor_fundo, d.criado_em
        );
    }

    /**
     * Insere um novo disco no banco.
     * Retorna o ID gerado.
     */
    static async adicionar(album, artista, generos, descricao, preco, quantidade, status, imagem, destaque, cor_fundo) {
        const imagemFinal  = imagem   || null;
        const destaqueVal  = destaque ? 1 : 0;
        const corFundoFinal = cor_fundo || '#1a1a1a';

        const [resultado] = await db.execute(
            `INSERT INTO discos
             (album, artista, generos, descricao, preco, quantidade, status, imagem, destaque, cor_fundo)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [album, artista, generos, descricao, preco, quantidade, status,
             imagemFinal, destaqueVal, corFundoFinal]
        );
        return resultado.insertId;
    }

    /**
     * Atualiza um disco existente.
     * Se nova imagem for fornecida, atualiza; caso contrário mantém a atual.
     */
    static async editar(id, album, artista, generos, descricao, preco, quantidade, status, imagem, destaque, cor_fundo) {
        const destaqueVal   = destaque ? 1 : 0;
        const corFundoFinal = cor_fundo || '#1a1a1a';

        if (imagem) {
            await db.execute(
                `UPDATE discos SET album=?, artista=?, generos=?, descricao=?, preco=?,
                 quantidade=?, status=?, imagem=?, destaque=?, cor_fundo=? WHERE id=?`,
                [album, artista, generos, descricao, preco, quantidade, status,
                 imagem, destaqueVal, corFundoFinal, id]
            );
        } else {
            await db.execute(
                `UPDATE discos SET album=?, artista=?, generos=?, descricao=?, preco=?,
                 quantidade=?, status=?, destaque=?, cor_fundo=? WHERE id=?`,
                [album, artista, generos, descricao, preco, quantidade, status,
                 destaqueVal, corFundoFinal, id]
            );
        }
    }

    /**
     * Alterna o status do disco: Disponível ↔ Indisponível.
     */
    static async alterarStatus(id, novoStatus) {
        await db.execute('UPDATE discos SET status=? WHERE id=?', [novoStatus, id]);
    }

    /**
     * Remove um disco permanentemente.
     */
    static async deletar(id) {
        await db.execute('DELETE FROM discos WHERE id=?', [id]);
    }

    /**
     * Retorna estatísticas para os cards do painel admin.
     */
    static async estatisticas() {
        const [[total]]        = await db.execute('SELECT COUNT(*) AS total FROM discos');
        const [[disponiveis]]  = await db.execute("SELECT COUNT(*) AS total FROM discos WHERE status='Disponível'");
        const [[indisponiveis]]= await db.execute("SELECT COUNT(*) AS total FROM discos WHERE status='Indisponível'");
        const [[destaques]]    = await db.execute('SELECT COUNT(*) AS total FROM discos WHERE destaque=1');
        const [[estoque]]      = await db.execute('SELECT SUM(quantidade) AS total FROM discos');

        return {
            total:        total.total,
            disponiveis:  disponiveis.total,
            indisponiveis:indisponiveis.total,
            destaques:    destaques.total,
            estoque:      estoque.total || 0
        };
    }
}

module.exports = Disco;

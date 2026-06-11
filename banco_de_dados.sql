-- ============================================================
-- ECHOES DISCOS — Script de criação do banco de dados
-- Execute este arquivo no MySQL Workbench antes de tudo.
-- ============================================================

-- Remove o banco se já existir (útil para recriar do zero)
DROP DATABASE IF EXISTS echoes_db;

-- Cria o banco com suporte completo a UTF-8 (acentos, emojis, etc.)
CREATE DATABASE echoes_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE echoes_db;

-- ============================================================
-- TABELA DE USUÁRIOS
-- role: 'admin' (controle total) ou 'usuario' (só visualiza)
-- ============================================================
CREATE TABLE IF NOT EXISTS usuarios (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    username   VARCHAR(50)  NOT NULL UNIQUE,
    password   VARCHAR(255) NOT NULL,           -- senha armazenada como hash bcrypt
    role       ENUM('admin','usuario') NOT NULL,
    criado_em  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- TABELA DE DISCOS
-- ============================================================
CREATE TABLE IF NOT EXISTS discos (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    album       VARCHAR(150)  NOT NULL,
    artista     VARCHAR(100)  NOT NULL,
    generos     VARCHAR(200)  NOT NULL,          -- ex: "grunge/alt rock/punk rock"
    descricao   TEXT          NOT NULL,
    preco       DECIMAL(8,2)  NOT NULL,
    quantidade  INT           NOT NULL DEFAULT 0, -- controle de estoque
    status      ENUM('Disponível','Indisponível') DEFAULT 'Disponível',
    imagem      VARCHAR(255)  DEFAULT NULL,       -- nome do arquivo ou URL externa
    destaque    TINYINT(1)    DEFAULT 0,          -- 1 = aparece no carrossel "Em Alta"
    cor_fundo   VARCHAR(7)    DEFAULT '#1a1a1a',  -- hex para o carrossel (ex: #320D01)
    criado_em   TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- TABELA DE PEDIDOS (histórico de compras)
-- ============================================================
CREATE TABLE IF NOT EXISTS pedidos (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    cliente     VARCHAR(100) NOT NULL,
    email       VARCHAR(150) NOT NULL,
    total       DECIMAL(8,2) NOT NULL,
    criado_em   TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- TABELA DE ITENS DO PEDIDO
-- ============================================================
CREATE TABLE IF NOT EXISTS pedido_itens (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    pedido_id   INT          NOT NULL,
    disco_id    INT          NOT NULL,
    quantidade  INT          NOT NULL DEFAULT 1,
    preco_unit  DECIMAL(8,2) NOT NULL,
    FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE,
    FOREIGN KEY (disco_id)  REFERENCES discos(id)  ON DELETE RESTRICT
);

-- ============================================================
-- DADOS INICIAIS — 9 discos originais do catálogo
-- As imagens correspondem aos arquivos em assets/img/
-- ============================================================
INSERT INTO discos (album, artista, generos, descricao, preco, quantidade, status, imagem, destaque, cor_fundo) VALUES
  ('Live Through This', 'Hole',           'grunge/alt rock/punk rock',
   'Álbum icônico de 1994 que consolidou Hole como uma das bandas mais impactantes do grunge. Com letras brutas e emotivas de Courtney Love, o disco explora temas de trauma, identidade e sobrevivência de forma visceral.',
   170.00, 33, 'Disponível', 'hole.png',     0, '#1a0000'),

  ('Autodomínio',       'pumapjl',        'boom-bap/jazz rap/hip-hop',
   'Álbum debut do produtor brasileiro pumapjl, que mescla beats cinematográficos com samples de jazz e soul. Uma viagem sonora que une a tradição do boom-bap americano ao contexto urbano nacional.',
   140.00, 27, 'Disponível', 'pumapjl.png',  0, '#1a1a2e'),

  ('WEEDKILLER',        'Ashnikko',       'hyperpop/industrial/trap metal',
   'Álbum de estreia da artista britânica Ashnikko, ambientado em um futuro distópico onde fadas enfrentam máquinas destruidoras. Som ousado, eclético e visualmente impactante que desafia qualquer categoria.',
   270.00, 40, 'Disponível', 'ashnikko.png', 1, '#1a001a'),

  ('Fetiche',           'Yung Vegan',     'hip-hop/boom-bap/jazz/drumless',
   'Projeto intimista do rapper Yung Vegan, explorando a vulnerabilidade masculina com beats minimalistas e letras honestas. Um dos trabalhos mais corajosos do rap nacional independente.',
   130.00, 29, 'Disponível', 'vegan.png',    0, '#001a00'),

  ('Jar of Flies',      'Alice in Chains','grunge/alt rock/hard rock/rock',
   'EP acústico lançado em 1994 que mostrou um lado mais reflexivo e melancólico do Alice in Chains. "Would?" e "Nutshell" tornaram-se hinos geracionais sobre perda, vício e beleza efêmera.',
   290.00, 15, 'Disponível', 'alice.png',    1, '#0d1a00'),

  ('OPROPRIO',          'Yago Oproprio',  'hip-hop/mpb/r&b/boom-bap',
   'Obra-prima do rapper carioca Yago Oproprio, onde MPB, R&B e hip-hop se encontram em letras densas sobre identidade negra, amor e pertencimento. Considerado um divisor de águas no rap brasileiro.',
   410.00, 12, 'Disponível', 'yago.png',     1, '#1a0d00'),

  ('Red Light',         'f(x)',           'k-pop/dance/electropop/hip-hop',
   'Terceiro álbum do grupo sul-coreano f(x), aclamado pela crítica como um dos mais inovadores do K-pop. Sonoridade experimental que mistura synth-pop, eletrônico e hip-hop com uma estética artsy única.',
   230.00, 22, 'Disponível', 'fx.png',       0, '#1a001a'),

  ('Luz',               'Djavan',         'mpb/soul/funk/pop/jazz/regional',
   'Um dos álbuns mais importantes da MPB, lançado em 1982. Djavan apresenta composições sofisticadas que transitam entre o nordeste brasileiro e influências internacionais de soul e jazz, criando sua sonoridade inconfundível.',
   200.00, 45, 'Disponível', 'djavan.png',   0, '#1a1000'),

  ('Etazhi',            'Molchat Doma',   'synth pop/dark wave/new wave',
   'Segundo álbum da banda bielorrussa Molchat Doma, que se tornou viral por capturar o espírito melancólico do pós-soviético. Letras em russo sobre alienação urbana com uma trilha sonora de darkwave densa e hipnótica.',
   250.00, 38, 'Disponível', 'molchat.png',  1, '#003459');

-- ============================================================
-- DADOS INICIAIS — pedidos de exemplo (histórico)
-- ============================================================
INSERT INTO pedidos (cliente, email, total, criado_em) VALUES
  ('Maria',   'maria@email.com',   270.00, '2026-04-16 14:30:00'),
  ('Gabriel', 'gabriel@email.com', 550.00, '2026-02-01 11:15:00'),
  ('Alice',   'alice@email.com',   290.00, '2026-01-29 09:45:00');

INSERT INTO pedido_itens (pedido_id, disco_id, quantidade, preco_unit) VALUES
  (1, 3, 1, 270.00),  -- Maria comprou WEEDKILLER
  (2, 2, 1, 140.00),  -- Gabriel comprou pumapjl
  (2, 6, 1, 410.00),  -- Gabriel comprou OPROPRIO
  (3, 5, 1, 290.00);  -- Alice comprou Jar of Flies

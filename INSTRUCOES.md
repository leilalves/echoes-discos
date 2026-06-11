# 🎵 ECHOES DISCOS — Guia Completo de Instalação e Uso

---

## Estrutura do Projeto

```
echoes-discos/
│
├── banco_de_dados.sql          ← Execute PRIMEIRO no MySQL
│
├── backend/
│   ├── server.js               ← Ponto de entrada do servidor Express
│   ├── seed.js                 ← Cria os usuários iniciais (admin + usuario)
│   ├── package.json
│   ├── .env                    ← Credenciais do banco (EDITE ANTES DE RODAR)
│   │
│   ├── config/
│   │   ├── db.js               ← Pool de conexão MySQL
│   │   └── upload.js           ← Configuração Multer (upload de capas)
│   │
│   ├── models/
│   │   ├── Disco.js            ← Model do disco (CRUD + estatísticas)
│   │   ├── Usuario.js          ← Model de usuário (autenticação bcrypt)
│   │   └── Pedido.js           ← Model de pedidos (histórico de compras)
│   │
│   ├── controllers/
│   │   ├── AuthController.js   ← Login, logout, verificação de sessão
│   │   ├── DiscoController.js  ← CRUD de discos + estatísticas
│   │   └── PedidoController.js ← Listagem e estatísticas de pedidos
│   │
│   ├── middleware/
│   │   └── auth.js             ← Proteção de rotas (autenticado, apenasAdmin)
│   │
│   └── routes/
│       └── api.js              ← Todas as rotas REST da aplicação
│
├── frontend/
│   ├── assets/
│   │   ├── img/                ← Todas as imagens (capas + UI)
│   │   └── fonts/              ← Fontes Mango, Calfine, Blackbird
│   │
│   ├── css/
│   │   └── style.css           ← CSS completo (original + estilos do sistema)
│   │
│   └── views/
│       ├── index.html          ← Site público (carrossel + catálogo dinâmico)
│       ├── login.html          ← Tela de login
│       ├── dashboard.html      ← Painel Admin (CRUD completo)
│       └── painel-usuario.html ← Painel do usuário (somente visualização)
│
└── uploads/                    ← Capas enviadas pelo admin (criado automaticamente)
```

---

## Pré-requisitos

| Ferramenta | Versão mínima | Download |
|-----------|--------------|---------|
| Node.js   | 18.x         | https://nodejs.org |
| npm       | 9.x          | (vem com o Node) |
| MySQL     | 8.x          | https://dev.mysql.com/downloads/ |

---

## Instalação Passo a Passo

### 1. Criar o Banco de Dados

Abra o **MySQL Workbench** (ou qualquer cliente MySQL) e execute:

```sql
-- Abra o arquivo banco_de_dados.sql e execute tudo
SOURCE /caminho/para/echoes-discos/banco_de_dados.sql;
```

Ou copie e cole o conteúdo do arquivo `banco_de_dados.sql` diretamente no Workbench e execute.

Isso irá criar:
- Banco `echoes_db`
- Tabelas: `usuarios`, `discos`, `pedidos`, `pedido_itens`
- 9 discos do catálogo original já inseridos
- 3 pedidos de exemplo

---

### 2. Configurar o Arquivo .env

Edite `backend/.env` com suas credenciais MySQL:

```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=SUA_SENHA_AQUI   ← altere aqui
DB_NAME=echoes_db
SESSION_SECRET=echoes_discos_secret_2024
```

---

### 3. Instalar Dependências

```bash
cd backend
npm install
```

---

### 4. Criar Usuários Iniciais

```bash
node seed.js
```

Saída esperada:
```
✅  admin      (admin)
✅  usuario    (usuario)
✅  Seed concluído!
```

---

### 5. Iniciar o Servidor

```bash
# Modo produção
npm start

# Modo desenvolvimento (auto-reload)
npm run dev
```

Saída esperada:
```
🎵  ECHOES DISCOS — Servidor iniciado

🌐  Site público:     http://localhost:3000/
🔐  Login:            http://localhost:3000/login
🛠️   Dashboard Admin:  http://localhost:3000/dashboard
👤  Painel Usuário:   http://localhost:3000/painel
```

---

## Credenciais de Acesso

| Usuário  | Senha    | Perfil  | Acesso |
|---------|---------|--------|--------|
| admin   | admin123 | Admin  | Painel completo + CRUD |
| usuario | user123  | Usuário | Visualização do catálogo |

> **Dica de segurança:** Altere as senhas padrão antes de colocar em produção.

---

## Funcionalidades por Perfil

### 🔓 Visitante (sem login)
- Visualizar o site público (`/`)
- Ver carrossel "Em Alta" com discos em destaque
- Navegar pelo catálogo (somente Disponíveis)
- Filtrar por status e pesquisar por nome/artista/gênero
- Ver modal com detalhes do disco
- Ver seção "Sobre" e formulário de contato

### 👤 Usuário (`/painel`)
- Tudo do visitante +
- Ver **todos** os discos (inclusive Indisponíveis)
- Filtros rápidos por gênero
- Cards clicáveis com detalhes, preço e estoque

### 🛠️ Admin (`/dashboard`)
- Tudo do usuário +
- **Cards de estatísticas** em tempo real (total, disponíveis, destaque, estoque, pedidos)
- **Cadastrar** novos discos (com upload de capa ou URL externa)
- **Editar** qualquer disco (abre modal pré-preenchido)
- **Alternar** disponibilidade (Disponível ↔ Indisponível) com 1 clique
- **Excluir** disco (com modal de confirmação)
- **Controle de destaque** — marcar/desmarcar para o carrossel "Em Alta"
- **Cor personalizada** do carrossel por disco (color picker)
- **Lista de estoque** — discos disponíveis e discos em falta (qtd = 0)
- **Histórico de pedidos** com itens detalhados

---

## Rotas da API REST

### Públicas (sem autenticação)
```
GET  /api/public/discos       → Discos disponíveis (catálogo público)
GET  /api/public/destaques    → Discos em destaque (carrossel)
POST /api/login               → Autenticação
```

### Autenticadas (qualquer usuário logado)
```
GET  /api/sessao              → Dados da sessão atual
POST /api/logout              → Encerrar sessão
GET  /api/discos              → Todos os discos
GET  /api/discos/:id          → Um disco pelo ID
```

### Somente Admin
```
POST   /api/discos            → Cadastrar disco (multipart/form-data)
PUT    /api/discos/:id        → Editar disco
PUT    /api/discos/:id/status → Alternar disponibilidade
DELETE /api/discos/:id        → Excluir disco
GET    /api/admin/estatisticas → Cards do painel
GET    /api/admin/pedidos      → Histórico de pedidos
GET    /api/admin/pedidos/stats → Totais de vendas
```

---

## Upload de Imagens

O admin pode fazer upload direto **ou** informar uma URL externa.

- **Upload:** Aceita `.jpg`, `.png`, `.webp` até **5 MB**
- **URL externa:** Cole o link direto da imagem (ex: Discogs, Last.fm)
- **Assets locais:** Os 9 discos originais usam as imagens em `frontend/assets/img/`

Arquivos enviados são salvos em `uploads/` com nome único baseado em timestamp.

---

## Padrão MVC Adotado

```
Requisição HTTP
      ↓
  server.js  (Express + middlewares globais)
      ↓
  routes/api.js  (define qual controller atende cada rota)
      ↓
  middleware/auth.js  (verifica sessão / perfil antes de chegar ao controller)
      ↓
  controllers/*.js  (valida dados, chama o model, retorna JSON)
      ↓
  models/*.js  (queries SQL, lógica de negócio, retorna dados)
      ↓
  config/db.js  (pool MySQL)
```

---

## Dicas de Desenvolvimento

```bash
# Recriar o banco do zero (apaga tudo e reinserid dados)
# Execute banco_de_dados.sql novamente e depois:
node seed.js

# Ver logs do servidor
npm run dev    # nodemon mostra todos os erros no terminal

# Testar a API com curl
curl http://localhost:3000/api/public/discos
```

---

## Problemas Comuns

| Problema | Solução |
|---------|--------|
| `ER_ACCESS_DENIED_ERROR` | Verifique `DB_USER` e `DB_PASSWORD` no `.env` |
| `ER_BAD_DB_ERROR` | Execute o `banco_de_dados.sql` antes de iniciar |
| Imagens não aparecem | Verifique se a pasta `frontend/assets/img/` existe com os arquivos |
| Login não funciona | Execute `node seed.js` para criar os usuários |
| Porta em uso | Altere `PORT` no `.env` (ex: 3001) |
| `Cannot find module` | Execute `npm install` dentro da pasta `backend/` |

---

## Tecnologias Utilizadas

**Backend**
- Node.js + Express 5
- mysql2/promise (pool de conexões)
- bcrypt (hash de senhas)
- express-session (autenticação por sessão)
- multer (upload de imagens)
- dotenv (variáveis de ambiente)

**Frontend**
- HTML5 + CSS3 (design original preservado)
- Bootstrap 5 (grid, carousel, modais)
- Font Awesome + Bootstrap Icons
- JavaScript puro (Fetch API, sem framework)

**Banco de Dados**
- MySQL 8 (InnoDB, UTF-8 mb4)

---

*Echoes Discos — Sistema completo MVC com Node.js + MySQL*

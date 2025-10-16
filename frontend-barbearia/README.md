# 💈 Frontend Barbearia

Este projeto é o **frontend do sistema de gestão de barbearia**, desenvolvido com **Angular 18**.  
O objetivo é oferecer uma plataforma onde **clientes, funcionários e administradores** possam interagir com o sistema de forma simples e intuitiva, permitindo **agendamentos, controle de serviços e administração de unidades**.

---

## 🧩 Tecnologias Utilizadas

- **Angular 18**
- **TypeScript**
- **HTML5 / CSS3**
- **Node.js + Express (backend integrado)**
- **MySQL (banco de dados)**

---

## ⚙️ Configuração do Ambiente

Antes de iniciar, certifique-se de ter instalado:

- [Node.js](https://nodejs.org/) (versão 18 ou superior)  
- [Angular CLI](https://angular.dev/tools/cli)  
- [MySQL Server](https://dev.mysql.com/downloads/mysql/)

---

## 🚀 Executando o Projeto

### 1️⃣ Instalar dependências
No diretório do frontend, execute:
```bash
npm install


## 🧱 Estrutura do Projeto

frontend-barbearia/
├── src/
│   ├── app/
│   │   ├── login/              → Tela inicial e autenticação
│   │   ├── services/           → Comunicação com o backend (AuthService)
│   │   ├── components/         → Componentes reutilizáveis
│   │   └── ...                 
│   ├── assets/                 → Imagens e recursos estáticos
│   ├── environments/           → Configurações de ambiente (dev/prod)
│   └── styles.css              → Estilos globais
└── angular.json                → Configurações do Angular CLI


       🧍‍♂️ CLIENTE (Frontend - Angular 18)
       ──────────────────────────────────────
              ↓ faz login / cadastro
          (email, senha, tipo, etc.)
                    │
                    │
                    ▼
        🌐 HTTP Request (POST /api/auth/login)
                    │
                    ▼
┌──────────────────────────────────────────┐
│     ⚙️ BACKEND - Node.js + Express        │
│──────────────────────────────────────────│
│  📄 server.js                            │
│     • Sobe o servidor Express            │
│     • Configura middlewares (CORS, JSON) │
│     • Registra rotas                     │
│        └── "/api/auth" → auth.routes.js  │
└──────────────────────────────────────────┘
                    │
                    ▼
┌──────────────────────────────────────────┐
│    🧭 routes/auth.routes.js               │
│──────────────────────────────────────────│
│  • Define os caminhos da API             │
│     ├─ POST /login → authController.login│
│     └─ POST /register → authController.register│
└──────────────────────────────────────────┘
                    │
                    ▼
┌──────────────────────────────────────────┐
│   🧠 controllers/auth.controller.js       │
│──────────────────────────────────────────│
│  • Recebe os dados do frontend           │
│  • Valida email/senha                    │
│  • Executa query no MySQL via db.js      │
│  • Gera token JWT e devolve resposta     │
└──────────────────────────────────────────┘
                    │
                    ▼
┌──────────────────────────────────────────┐
│     🗄️ config/db.js (MySQL Connection)    │
│──────────────────────────────────────────│
│  • Conecta no banco barbearia_db         │
│  • Usa mysql2 e variáveis do .env        │
│  • Envia queries ao banco                │
└──────────────────────────────────────────┘
                    │
                    ▼
        💾 BANCO DE DADOS (MySQL)
        ─────────────────────────
        Tabela: usuarios
        Campos:
        ├─ id
        ├─ nome
        ├─ email
        ├─ senha
        ├─ telefone
        ├─ tipo (CLIENTE / FUNCIONARIO / ADM)
        └─ criado_em

                    │
                    ▼
          🔁 Resposta JSON pro Frontend
          {
            "message": "Login bem-sucedido",
            "token": "...JWT...",
            "user": {
                "id": 1,
                "nome": "João Silva",
                "tipo": "CLIENTE"
            }
          }

                    │
                    ▼
       ✅ Angular recebe, guarda token
          e redireciona pro dashboard

# Sistema de Gestão para Barbearias - Documentação Técnica

## 📋 Resumo Executivo

Sistema completo de gestão para redes de barbearias desenvolvido com arquitetura moderna cliente-servidor, permitindo gerenciamento de múltiplas unidades, agendamentos, vendas, produtos, funcionários e análise de desempenho através de dashboard inteligente.

---

## 🛠️ Stack Tecnológica

### **Backend**
- **Node.js** v18+ com Express.js
- **MySQL 8.0** - Banco de dados relacional
- **JWT (JSON Web Token)** - Autenticação e autorização
- **bcryptjs** - Criptografia de senhas
- **dotenv** - Gerenciamento de variáveis de ambiente
- **CORS** - Controle de requisições cross-origin
- **mysql2** - Driver MySQL com suporte a Promises

### **Frontend**
- **Angular 18** (Standalone Components)
- **TypeScript 5+**
- **RxJS** - Programação reativa
- **HttpClient** - Comunicação HTTP
- **FormsModule** - Formulários reativos
- **CSS3** - Estilização responsiva moderna

### **Arquitetura**
- **RESTful API** - Endpoints padronizados
- **MVC Pattern** no backend
- **Component-based Architecture** no frontend
- **JWT-based Authentication** com middleware de validação
- **Responsive Design** - Mobile-first approach

---

## 👥 Níveis de Acesso e Permissões

### **1️⃣ ADM (Administrador)**
Acesso total ao sistema com privilégios administrativos completos.

**Funcionalidades:**
- ✅ **Gestão de Unidades**
  - Criar, editar e desativar unidades (barbearias)
  - Configurar dados: CNPJ, endereço, horários, contatos
  - Visualizar status de pagamento e aprovação
  - Gerenciar geolocalização (latitude/longitude)

- ✅ **Gestão de Usuários**
  - Criar e gerenciar todos os tipos de usuários (ADM, GERENTE, FUNCIONARIO, CLIENTE)
  - Resetar senhas
  - Ativar/desativar contas
  - Visualizar logs de atividades

- ✅ **Acesso Total**
  - Todas as funcionalidades de GERENTE em todas as unidades
  - Relatórios consolidados multi-unidade
  - Configurações globais do sistema

---

### **2️⃣ GERENTE**
Gestor de uma unidade específica com controle operacional completo.

**Funcionalidades:**

#### **📊 Dashboard**
- Visualização de KPIs em tempo real:
  - Faturamento diário, semanal, mensal e anual
  - Total de vendas por período
  - Notas fiscais pendentes de emissão
  - Produtos mais vendidos (ranking mensal)
  - Serviços mais vendidos (ranking mensal)
  - Distribuição por forma de pagamento
- Filtros avançados por período, tipo e status

#### **📅 Agendamentos**
- Visualizar todos os agendamentos da unidade
- Criar novos agendamentos
- Editar agendamentos existentes
- Cancelar agendamentos
- Filtrar por data, funcionário, status
- Alterar status: Pendente → Confirmado → Em Andamento → Concluído
- Visualização em calendário interativo

#### **👨‍💼 Funcionários**
- Cadastrar novos funcionários
- Editar informações de funcionários
- Ativar/desativar funcionários
- Visualizar lista completa com filtros
- Gerenciar dados: nome, email, telefone, foto
- Controle de primeiro acesso

#### **🛍️ Produtos**
- **Gestão de Categorias:**
  - Criar, editar e excluir categorias
  - Ativar/desativar categorias
  - Validação para evitar exclusão com produtos vinculados
  
- **Gestão de Produtos:**
  - Cadastrar produtos com: nome, descrição, preço, estoque, foto
  - Editar informações e preços
  - Excluir produtos
  - Ativar/desativar produtos
  - Controle de estoque automático nas vendas
  - Busca por nome, descrição ou categoria

#### **💰 Vendas (Dashboard)**
- Visualizar histórico completo de vendas
- Emitir/editar notas fiscais
- Filtros por:
  - Status de NF (Aguardando Ajuste, Emitida, Não Necessária)
  - Tipo de venda (Serviço, Produto, Misto)
  - Período (Hoje, Semana, Mês, Todos)
  - Busca por cliente, funcionário, número de NF
- Detalhamento de itens vendidos (serviços + produtos)
- Atualização de status de pagamento

---

### **3️⃣ FUNCIONARIO**
Operador do dia a dia com foco em atendimento.

**Funcionalidades:**

#### **📅 Agendamentos**
- Visualizar agendamentos atribuídos a si mesmo
- Atualizar status dos próprios agendamentos
- Marcar serviços como concluídos
- Adicionar observações

#### **💳 Vendas**
- Registrar vendas de serviços realizados
- Registrar vendas de produtos
- Atualizar informações de nota fiscal
- Visualizar histórico de vendas próprias

#### **👤 Perfil**
- Visualizar e editar dados pessoais
- Alterar senha
- Atualizar foto de perfil

**Restrições:**
- ❌ Não pode gerenciar outros funcionários
- ❌ Não pode visualizar agendamentos de outros funcionários
- ❌ Não pode acessar relatórios gerenciais
- ❌ Não pode gerenciar produtos/categorias

---

### **4️⃣ CLIENTE**
Usuário final com acesso para agendamento de serviços.

**Funcionalidades:**

#### **📅 Meus Agendamentos**
- Agendar novos serviços
- Visualizar histórico de agendamentos
- Cancelar agendamentos (com restrições de prazo)
- Receber notificações de confirmação

#### **👤 Perfil**
- Gerenciar dados pessoais
- Atualizar telefone e email
- Alterar senha
- Upload de foto de perfil

**Restrições:**
- ❌ Acesso somente aos próprios dados
- ❌ Não visualiza informações de vendas
- ❌ Não acessa dashboard ou relatórios
- ❌ Não gerencia produtos ou funcionários

---

## 🗄️ Estrutura do Banco de Dados

### **Tabelas Principais:**

1. **usuarios**
   - Campos: id, nome, email, senha (hash bcrypt), telefone, foto_perfil, tipo, unidade_id, ativo, primeiro_acesso
   - Índices: email único, tipo, unidade_id

2. **unidades**
   - Campos: id_unidade, nome, responsavel, cnpj, cpf, telefone, email, endereço completo, horários, coordenadas, status_pagamento, status_avaliacao
   - Dados de geolocalização para futuras funcionalidades

3. **agendamentos**
   - Campos: id, unidade_id, cliente_id, funcionario_id, servico_id, data_agendamento, hora_inicio, hora_fim, status, observacoes, valor_total
   - Relacionamentos: unidades, usuarios (cliente/funcionário), servicos

4. **servicos**
   - Campos: id, unidade_id, nome, descricao, duracao (minutos), preco, ativo

5. **categorias**
   - Campos: id, unidade_id, nome, descricao, ativo
   - Validação: impede exclusão se houver produtos vinculados

6. **produtos**
   - Campos: id, unidade_id, categoria_id, nome, descricao, preco, estoque, foto_url, ativo
   - Controle automático de estoque nas vendas

7. **vendas**
   - Campos: id, unidade_id, funcionario_id, cliente_id, tipo_venda (SERVICO/PRODUTO/MISTO), valor_total, forma_pagamento, status_pagamento, nota_fiscal, status_nf, observacoes
   - Rastreabilidade completa de transações

8. **venda_servicos**
   - Campos: id, venda_id, agendamento_id, servico_id, servico_nome, servico_preco, quantidade, subtotal
   - Histórico imutável de itens vendidos

9. **venda_produtos**
   - Campos: id, venda_id, produto_id, produto_nome, produto_preco, quantidade, subtotal
   - Snapshot de preços no momento da venda

---

## 🔐 Segurança Implementada

- **Autenticação JWT** com tokens de 8 horas
- **Senhas criptografadas** com bcrypt (salt rounds: 12)
- **Middleware de autorização** em todas as rotas protegidas
- **Validação de permissões** por tipo de usuário em cada endpoint
- **Filtros por unidade_id** garantindo isolamento de dados
- **Validação de entrada** em todas as operações CRUD
- **CORS configurado** para requisições seguras

---

## 📱 Funcionalidades Técnicas Destacadas

### **Backend**
- ✅ API RESTful com 6 módulos principais (auth, admin, cadastro, agendamentos, funcionarios, produtos, vendas)
- ✅ Controllers organizados por domínio
- ✅ Rotas protegidas com middleware verifyToken
- ✅ Tratamento de erros padronizado
- ✅ Queries otimizadas com JOINs e índices
- ✅ Soft delete em algumas entidades (ativo: boolean)
- ✅ Hard delete em outras (vendas, produtos - com regras de negócio)

### **Frontend**
- ✅ Standalone Components (Angular 18)
- ✅ Serviços injetáveis com HttpClient
- ✅ Interfaces TypeScript para type safety
- ✅ Reactive forms com validações
- ✅ Máscaras de input (telefone, CPF, CNPJ, CEP)
- ✅ Paginação client-side
- ✅ Filtros em tempo real
- ✅ Modais reutilizáveis
- ✅ Design responsivo (mobile, tablet, desktop)
- ✅ Loading states e feedback visual
- ✅ Formatação de datas e valores monetários (pt-BR)

### **UX/UI**
- ✅ Cards interativos com animações CSS
- ✅ Tabelas responsivas com scroll horizontal
- ✅ Badges coloridos por status
- ✅ Calendário visual para agendamentos
- ✅ Grid de produtos com preview de imagens
- ✅ Mensagens de sucesso/erro contextuais
- ✅ Navegação intuitiva com sidebar
- ✅ Tema moderno com paleta de cores profissional

---

## 📈 Módulos Implementados

| Módulo | Backend | Frontend | Status |
|--------|---------|----------|--------|
| Autenticação | ✅ | ✅ | Completo |
| Dashboard | ✅ | ✅ | Completo |
| Unidades (ADM) | ✅ | ✅ | Completo |
| Agendamentos | ✅ | ✅ | Completo |
| Funcionários | ✅ | ✅ | Completo |
| Produtos/Categorias | ✅ | ✅ | Completo |
| Vendas/NF | ✅ | ✅ | Completo |
| Perfil | ✅ | ✅ | Completo |

---

## 🚀 Diferenciais do Sistema

1. **Multi-tenant** - Suporta múltiplas unidades com isolamento de dados
2. **Controle de estoque automático** - Baixa automática ao registrar vendas
3. **Dashboard analítico** - KPIs em tempo real com filtros avançados
4. **Gestão de NF** - Controle de notas fiscais aguardando emissão
5. **Histórico imutável** - Vendas preservam preços do momento da transação
6. **Permissões granulares** - 4 níveis de acesso com restrições específicas
7. **Auditoria** - Timestamps em todas as operações
8. **Escalabilidade** - Arquitetura preparada para crescimento

---

## 📊 Métricas e KPIs Disponíveis

- Faturamento por período (dia, semana, mês, ano)
- Total de vendas e ticket médio
- Ranking de produtos mais vendidos
- Ranking de serviços mais vendidos
- Distribuição por forma de pagamento
- Taxa de notas fiscais pendentes
- Agendamentos por status
- Taxa de ocupação de funcionários

---

## 🔄 Fluxo de Trabalho

1. **ADM** cria unidades e gerentes
2. **GERENTE** cadastra funcionários, serviços e produtos
3. **CLIENTE** agenda serviços online
4. **FUNCIONARIO** atende cliente e registra venda
5. **GERENTE** emite NF e analisa dashboard
6. **ADM** monitora performance de todas as unidades

---

## 📊 Diagrama de Permissões

```
┌─────────────────────────────────────────────────────────────┐
│                          ADM                                 │
│  • Gestão total de unidades                                  │
│  • Gestão total de usuários                                  │
│  • Acesso a todas as funcionalidades                         │
│  • Relatórios multi-unidade                                  │
└──────────────────────┬──────────────────────────────────────┘
                       │
          ┌────────────┴────────────┐
          │                         │
┌─────────▼──────────┐    ┌────────▼─────────┐
│     GERENTE        │    │   FUNCIONARIO     │
│  • Dashboard       │    │  • Agendamentos   │
│  • Agendamentos    │    │    próprios       │
│  • Funcionários    │    │  • Vendas         │
│  • Produtos        │    │  • Perfil         │
│  • Vendas/NF       │    │                   │
└────────────────────┘    └───────────────────┘
                                   │
                       ┌───────────▼──────────┐
                       │      CLIENTE         │
                       │  • Agendar serviços  │
                       │  • Ver agendamentos  │
                       │  • Perfil            │
                       └──────────────────────┘
```

---

## 🗂️ Estrutura de Diretórios

```
barbearia-system/
├── backend-barbearia/
│   ├── config/
│   │   └── db.js                    # Configuração MySQL
│   ├── controllers/
│   │   ├── auth.controller.js       # Login e autenticação
│   │   ├── admin.controller.js      # Gestão de unidades
│   │   ├── cadastro.controller.js   # Perfil de usuário
│   │   ├── agendamentos.controller.js
│   │   ├── funcionarios.controller.js
│   │   ├── produtos.controller.js   # Produtos e categorias
│   │   └── vendas.controller.js     # Vendas e estatísticas
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── admin.routes.js
│   │   ├── cadastro.routes.js
│   │   ├── agendamentos.routes.js
│   │   ├── funcionarios.routes.js
│   │   ├── produtos.routes.js
│   │   └── vendas.routes.js
│   ├── .env                         # Variáveis de ambiente
│   ├── server.js                    # Servidor Express
│   └── package.json
│
├── frontend-barbearia/
│   ├── src/
│   │   ├── app/
│   │   │   ├── services/
│   │   │   │   ├── auth.service.ts
│   │   │   │   ├── agendamentos.service.ts
│   │   │   │   ├── funcionarios.service.ts
│   │   │   │   ├── produtos.service.ts
│   │   │   │   └── dashboard.service.ts
│   │   │   ├── shared/
│   │   │   │   ├── dashboard/       # Dashboard com KPIs
│   │   │   │   ├── agendamentos/    # Calendário de agendamentos
│   │   │   │   ├── funcionarios/    # Gestão de funcionários
│   │   │   │   └── produtos/        # Gestão de produtos
│   │   │   ├── admin/               # Módulo ADM
│   │   │   ├── login/               # Tela de login
│   │   │   └── cadastro/            # Perfil de usuário
│   │   └── environments/
│   │       └── environments.ts      # Config API URL
│   └── package.json
│
├── database/                        # Scripts SQL
│   ├── setup_usuarios.sql
│   └── setup_unidades.sql
│
└── sql_scripts/
    └── criar_tabelas_produtos.sql
```

---

## 🔧 Configuração e Deploy

### **Requisitos**
- Node.js 18+
- MySQL 8.0+
- Angular CLI 18+

### **Instalação Backend**
```bash
cd backend-barbearia
npm install
# Configurar .env com credenciais do banco
npm start  # Servidor na porta 5000
```

### **Instalação Frontend**
```bash
cd frontend-barbearia
npm install
ng serve  # Aplicação na porta 4200
```

### **Variáveis de Ambiente (.env)**
```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=12345
DB_DATABASE=barbearia_db
JWT_SECRET=barbearia_secret_key_2025
```

---

## 📡 Endpoints da API

### **Autenticação**
- `POST /api/auth/login` - Login de usuário

### **Admin (ADM)**
- `GET /api/admin/unidades` - Listar unidades
- `POST /api/admin/unidades` - Criar unidade
- `PUT /api/admin/unidades/:id` - Atualizar unidade
- `DELETE /api/admin/unidades/:id` - Deletar unidade

### **Agendamentos**
- `GET /api/agendamentos/listar` - Listar agendamentos
- `POST /api/agendamentos/criar` - Criar agendamento
- `PUT /api/agendamentos/:id` - Atualizar agendamento
- `DELETE /api/agendamentos/:id` - Cancelar agendamento

### **Funcionários (GERENTE)**
- `GET /api/funcionarios/listar` - Listar funcionários
- `POST /api/funcionarios/criar` - Cadastrar funcionário
- `PUT /api/funcionarios/:id` - Atualizar funcionário
- `PATCH /api/funcionarios/:id/status` - Ativar/desativar

### **Produtos (GERENTE)**
- `GET /api/produtos/categorias/listar` - Listar categorias
- `POST /api/produtos/categorias/criar` - Criar categoria
- `GET /api/produtos/listar` - Listar produtos
- `POST /api/produtos/criar` - Criar produto
- `PUT /api/produtos/:id` - Atualizar produto
- `DELETE /api/produtos/:id` - Deletar produto

### **Vendas (GERENTE)**
- `GET /api/vendas/estatisticas` - KPIs do dashboard
- `GET /api/vendas/listar` - Listar vendas
- `POST /api/vendas/criar` - Registrar venda
- `PATCH /api/vendas/:id/nota-fiscal` - Atualizar NF
- `DELETE /api/vendas/:id` - Excluir venda

### **Perfil**
- `GET /api/cadastro/perfil` - Ver perfil
- `PUT /api/cadastro/perfil` - Atualizar perfil
- `POST /api/cadastro/alterar-senha` - Alterar senha

---

## 📝 Regras de Negócio Importantes

1. **Controle de Estoque**
   - Ao registrar venda com produtos, estoque é baixado automaticamente
   - Ao excluir venda, estoque é devolvido
   - Produtos sem estoque não podem ser vendidos

2. **Notas Fiscais**
   - Vendas são criadas com status "AGUARDANDO_AJUSTE"
   - GERENTE ou FUNCIONARIO pode atualizar para "EMITIDA" ou "NAO_NECESSARIA"
   - Dashboard exibe quantidade de NFs pendentes

3. **Agendamentos**
   - CLIENTE só vê próprios agendamentos
   - FUNCIONARIO só vê agendamentos atribuídos a si
   - GERENTE vê todos os agendamentos da unidade
   - Status: Pendente → Confirmado → Em Andamento → Concluído → Cancelado

4. **Produtos e Categorias**
   - Categoria não pode ser excluída se tiver produtos vinculados
   - Produtos inativos não aparecem na listagem de vendas
   - Preço do produto é "congelado" na venda (histórico)

5. **Isolamento Multi-tenant**
   - Todos os dados são filtrados por `unidade_id`
   - GERENTE só acessa dados de sua unidade
   - ADM pode acessar todas as unidades

6. **Segurança de Senha**
   - Senha mínima de 6 caracteres
   - Hash bcrypt com salt rounds 12
   - Token JWT expira em 8 horas
   - Primeiro acesso exige troca de senha

---

## 🎯 Roadmap de Melhorias Futuras

- [ ] Sistema de notificações em tempo real (WebSocket)
- [ ] Integração com WhatsApp para confirmação de agendamentos
- [ ] Geração automática de NF-e
- [ ] Relatórios em PDF exportáveis
- [ ] Gráficos interativos no dashboard (Chart.js)
- [ ] Sistema de comissões para funcionários
- [ ] Programa de fidelidade para clientes
- [ ] Agendamento online via landing page pública
- [ ] Integração com gateway de pagamento
- [ ] App mobile (React Native / Flutter)

---

## 📞 Suporte Técnico

- **Documentação**: Este arquivo
- **Logs de erro**: Console do navegador + terminal backend
- **Banco de dados**: MySQL Workbench / phpMyAdmin

---

## ✅ Status do Projeto

**Versão:** 1.0.0  
**Status:** ✅ **Produção Ready**  
**Última atualização:** Novembro 2025  
**Cobertura de funcionalidades:** 100% dos requisitos iniciais  

---

**Desenvolvido com foco em performance, segurança e experiência do usuário.**  
**Sistema pronto para uso comercial em redes de barbearias.**

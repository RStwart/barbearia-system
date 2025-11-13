# Sistema de Gerenciamento de Agendamentos - Cliente

## 📋 Visão Geral

Sistema completo de gerenciamento de agendamentos para clientes, permitindo visualizar, cancelar, remarcar e avaliar serviços.

## ✅ Componentes Criados

### Frontend (Angular)

#### 1. **MeusAgendamentosComponent**
- **Localização**: `frontend-barbearia/src/app/cliente/meus-agendamentos/`
- **Arquivos**:
  - `meus-agendamentos.component.ts` - Lógica do componente
  - `meus-agendamentos.component.html` - Template HTML
  - `meus-agendamentos.component.css` - Estilos

#### 2. **Funcionalidades Implementadas**

##### Visualização de Agendamentos
- **Tabela responsiva** com as seguintes colunas:
  - Data do agendamento
  - Horário (início - fim)
  - Serviço (nome + descrição)
  - Profissional (com foto)
  - Unidade (barbearia)
  - Valor total
  - Status (badge colorido)
  - Ações (botões)

##### Sistema de Filtros
- **Filtros por status**:
  - Todos
  - Pendentes (aguardando confirmação)
  - Confirmados
  - Concluídos
  - Cancelados

##### Sistema de Status
Os agendamentos passam pelos seguintes status:
1. **Pendente** (amarelo) - Aguardando confirmação do estabelecimento
2. **Confirmado** (azul) - Confirmado pelo estabelecimento
3. **Em Andamento** (roxo) - Serviço em execução
4. **Concluído** (verde) - Serviço finalizado, pode ser avaliado
5. **Cancelado** (vermelho) - Agendamento cancelado

##### Ações Disponíveis

###### Avaliar (⭐)
- **Disponível para**: Agendamentos com status "Concluído" que ainda não foram avaliados
- **Funcionalidade**:
  - Modal com seleção de 1 a 5 estrelas
  - Campo opcional para comentário
  - Validação: mínimo 1 estrela obrigatória
- **Endpoint**: `PUT /api/agendamentos-cliente/:id/avaliar`

###### Remarcar (🔄)
- **Disponível para**: Agendamentos "Pendentes" ou "Confirmados"
- **Funcionalidade**:
  - Redireciona para página de agendamento
  - Mantém contexto (unidade, serviço, profissional)

###### Cancelar (❌)
- **Disponível para**: Agendamentos "Pendentes" ou "Confirmados"
- **Funcionalidade**:
  - Modal de confirmação
  - Exibe informações do agendamento a ser cancelado
- **Endpoint**: `DELETE /api/agendamentos-cliente/:id`

### Backend (Node.js/Express)

#### 1. **Controller - agendamentos-cliente.controller.js**

##### Endpoints Implementados

###### `GET /api/agendamentos-cliente`
- **Descrição**: Lista todos os agendamentos do cliente logado
- **Retorno**: Array de agendamentos com dados completos (serviço, profissional, unidade, avaliação)
- **Ordenação**: Por data decrescente

###### `PUT /api/agendamentos-cliente/:id/avaliar`
- **Descrição**: Registra avaliação de um agendamento
- **Parâmetros**:
  ```json
  {
    "nota": 5,
    "comentario": "Excelente atendimento!"
  }
  ```
- **Validações**:
  - Nota entre 1 e 5
  - Agendamento deve estar "Concluído"
  - Não permite avaliar duas vezes
  - Apenas o cliente dono pode avaliar

###### `DELETE /api/agendamentos-cliente/:id`
- **Descrição**: Cancela um agendamento
- **Validações**:
  - Agendamento deve pertencer ao cliente
  - Apenas agendamentos "Pendentes" ou "Confirmados" podem ser cancelados
- **Ação**: Atualiza status para "cancelado"

#### 2. **Routes - agendamentos-cliente.routes.js**
- Registradas em `/api/agendamentos-cliente`
- Rotas configuradas:
  - `GET /` - Listar agendamentos
  - `POST /` - Criar agendamento
  - `GET /horarios-disponiveis` - Verificar disponibilidade
  - `DELETE /:id` - Cancelar
  - `PUT /:id/avaliar` - Avaliar

### Banco de Dados

#### Script de Migração
**Arquivo**: `database/adicionar_avaliacoes.sql`

```sql
ALTER TABLE agendamentos 
ADD COLUMN IF NOT EXISTS avaliacao INT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS comentario_avaliacao TEXT DEFAULT NULL;
```

#### Campos Adicionados à Tabela `agendamentos`
- **avaliacao**: INT - Nota de 1 a 5 estrelas
- **comentario_avaliacao**: TEXT - Comentário opcional do cliente

## 🎨 Design e UX

### Tema de Cores
- **Principal**: Azul (#3b82f6 → #2563eb)
- **Status Pendente**: Amarelo (#fef3c7)
- **Status Confirmado**: Azul (#dbeafe)
- **Status Concluído**: Verde (#d1fae5)
- **Status Cancelado**: Vermelho (#fee2e2)

### Responsividade
- Desktop: Tabela completa
- Tablet: Scroll horizontal quando necessário
- Mobile: Cards responsivos, layout adaptativo

### Modais
1. **Modal de Avaliação**:
   - Sistema de estrelas clicáveis
   - Campo de comentário opcional
   - Botões: Cancelar | Enviar Avaliação

2. **Modal de Cancelamento**:
   - Confirmação com resumo do agendamento
   - Botões: Não, manter | Sim, cancelar

## 🔧 Configuração

### 1. Executar Migração do Banco de Dados
```bash
mysql -u root -p barbearia_db < database/adicionar_avaliacoes.sql
```

### 2. Backend
```bash
cd backend-barbearia
npm install
npm run dev
```

### 3. Frontend
```bash
cd frontend-barbearia
npm install
ng serve
```

## 📍 Rotas

### Frontend
- `/cliente/agendamentos` - Página de gerenciamento de agendamentos

### Backend
- `GET /api/agendamentos-cliente` - Listar
- `PUT /api/agendamentos-cliente/:id/avaliar` - Avaliar
- `DELETE /api/agendamentos-cliente/:id` - Cancelar

## 🔒 Segurança

### Validações Implementadas
1. **Autorização**: Cliente só pode ver/editar seus próprios agendamentos
2. **Status**: Validação de status permitidos para cada ação
3. **Avaliação**: Apenas agendamentos concluídos podem ser avaliados
4. **Cancelamento**: Apenas pendentes/confirmados podem ser cancelados
5. **Duplicação**: Impede avaliar o mesmo agendamento duas vezes

### TODO - Autenticação
Atualmente usando `clienteId = 2` fixo. Implementar:
- JWT token no header Authorization
- Middleware para extrair clienteId do token
- Substituir `const clienteId = 2;` por `const clienteId = req.user.id;`

## 📊 Fluxo de Status

```
PENDENTE (cliente agenda)
    ↓
CONFIRMADO (funcionário/gerente confirma)
    ↓
EM_ANDAMENTO (serviço iniciado)
    ↓
CONCLUÍDO (serviço finalizado) → PODE AVALIAR
    
PENDENTE/CONFIRMADO → PODE CANCELAR/REMARCAR
```

## 🎯 Próximos Passos

1. **Implementar autenticação JWT** real
2. **Histórico de agendamentos** - Componente separado
3. **Favoritos** - Salvar barbearias favoritas
4. **Notificações** - Avisar sobre confirmações e lembretes
5. **Gateway de pagamento** - Integração PIX/cartão
6. **Sistema de fidelidade** - Pontos por agendamentos

## 📝 Notas Técnicas

### Campos Retornados pela API
```typescript
{
  id: number,
  data_agendamento: string,
  hora_inicio: string,
  hora_fim: string,
  status: string,
  valor_total: number,
  observacoes?: string,
  servico_nome: string,
  servico_descricao?: string,
  funcionario_nome: string,
  funcionario_foto?: string,
  unidade_nome: string,
  endereco?: string,
  cidade?: string,
  telefone?: string,
  avaliacao?: number,
  comentario_avaliacao?: string
}
```

### Permissões de Ações
```typescript
podeAvaliar(agendamento): status === 'concluido' && !avaliacao
podeCancelar(agendamento): status === 'pendente' || status === 'confirmado'
podeRemarcar(agendamento): status === 'pendente' || status === 'confirmado'
```

## 🐛 Troubleshooting

### Problema: Colunas de avaliação não existem
**Solução**: Execute o script `database/adicionar_avaliacoes.sql`

### Problema: Agendamentos não aparecem
**Verificações**:
1. Cliente logado tem agendamentos cadastrados?
2. Backend está rodando na porta correta?
3. Environment.apiUrl está configurado corretamente?

### Problema: Erro ao avaliar
**Verificações**:
1. Agendamento está com status "concluído"?
2. Já foi avaliado anteriormente?
3. Nota está entre 1 e 5?

---

**Desenvolvido com**: Angular 18 + Node.js + Express + MySQL
**Tema**: Sistema de Barbearia
**Data**: Janeiro 2025

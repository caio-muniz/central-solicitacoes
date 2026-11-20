

# Central de Solicitações

Aplicação web Full Stack para registrar solicitações internas e acompanhar seu andamento por um fluxo controlado de status.

## Objetivo

Substituir o controle informal de demandas por um sistema onde é possível cadastrar, consultar, filtrar e avançar solicitações pelo fluxo **Aberta → Em andamento → Concluída**, com as regras validadas no backend.

## Tecnologias

| Camada | Tecnologias |
| --- | --- |
| Frontend | React 18, Vite, JavaScript, React Router DOM, Axios, CSS puro, Lucide React, fonte Inter (`@fontsource`, funciona offline) |
| Backend | Node.js, Express, ES Modules, Better-SQLite3 (SQL explícito, sem ORM), CORS |
| Banco | SQLite (arquivo local) |

## Arquitetura

Backend em **camadas**, cada uma com uma responsabilidade:

- **routes** – define os endpoints e direciona para os controllers.
- **controllers** – recebem a requisição HTTP e devolvem a resposta. Sem regra de negócio e sem SQL.
- **services** – regras de negócio: validações, fluxo de status e transação.
- **repositories** – único lugar com SQL (consultas parametrizadas).
- **config** – conexão com o SQLite e criação automática das tabelas.
- **middlewares** – tratamento centralizado de erros.

O frontend é independente e só conversa com o backend pela API REST. Ele não decide regras: o botão de avançar usa o campo `nextStatus` calculado pela API.

## Estrutura de pastas

```
central-solicitacoes/
├── backend/
│   ├── database/          # central.db (criado automaticamente) e seed.js
│   └── src/
│       ├── config/database.js
│       ├── routes/request.routes.js
│       ├── controllers/request.controller.js
│       ├── services/request.service.js
│       ├── repositories/{request,history}.repository.js
│       ├── middlewares/error.middleware.js
│       ├── utils/app-error.js
│       ├── app.js
│       └── server.js
├── frontend/
│   └── src/
│       ├── components/    # Layout, Badge, Feedback
│       ├── pages/         # Dashboard, RequestList, NewRequest, RequestDetail
│       ├── services/api.js
│       ├── hooks/         # useAsync, useMeta
│       ├── utils/format.js
│       ├── styles/global.css
│       ├── App.jsx
│       └── main.jsx
├── .gitignore
└── README.md
```

## Requisitos

- Node.js 18 ou superior (testado com a versão disponível no ambiente de desenvolvimento)
- npm

## Instalação e execução

Use dois terminais.

**Backend** (porta 3001):

```bash
cd backend
npm install
npm start          # ou: npm run dev (reinicia ao salvar)
```

**Frontend** (porta 5173):

```bash
cd frontend
npm install
npm run dev
```

Acesse http://localhost:5173. O Vite encaminha `/api` para `http://localhost:3001`. Para usar outra URL de API, defina `VITE_API_URL` no frontend.

O banco `backend/database/central.db` e as tabelas são criados automaticamente na primeira execução. Os dados permanecem após reiniciar.

### Dados de demonstração (opcional)

```bash
cd backend
npm run seed
```

Insere 5 solicitações de exemplo. É um comando separado: a aplicação funciona sem ele, e rodá-lo mais de uma vez duplica os exemplos.

## Endpoints da API

| Método | Endpoint | Descrição |
| --- | --- | --- |
| POST | `/api/requests` | Criar solicitação (status inicial Aberta) |
| GET | `/api/requests` | Listar. Parâmetros: `status`, `priority`, `search`, `sort` (`recent` ou `oldest`) |
| GET | `/api/requests/:id` | Detalhes |
| PATCH | `/api/requests/:id/status` | Avançar status. Corpo: `{ "status": "Em andamento" }` |
| GET | `/api/requests/:id/history` | Histórico de mudanças de status |
| GET | `/api/dashboard` | Totais por status e solicitações recentes |
| GET | `/api/meta` | Categorias, prioridades e status aceitos |

**Formato das respostas**

- Sucesso: `{ "data": ... }` (a listagem inclui também `total`).
- Erro: `{ "error": { "message": "...", "fields": { "campo": "mensagem" } } }` (`fields` aparece em erros de validação do cadastro).
- Códigos: 200 sucesso, 201 criação, 400 dados inválidos ou transição inválida, 404 recurso inexistente, 500 erro inesperado.

## Funcionalidades

- Cadastro com título, descrição, categoria e prioridade (Baixa, Média, Alta); status inicial Aberta e data de criação automática.
- Listagem e detalhes (título, descrição, categoria, prioridade, status, datas).
- Filtros por status e prioridade, combináveis, executados na API.
- Fluxo de status Aberta → Em andamento → Concluída validado no backend (sem saltos, sem avançar solicitação concluída), inclusive para chamadas diretas à API.
- Persistência em SQLite com criação automática do banco e das tabelas.
- Validação no frontend e no backend, com mensagens exibidas na interface.
- Extras: busca textual (título e descrição) na API, dashboard com indicadores reais, histórico de status com atualização e registro em uma única transação, ordenação por data.
- Interface responsiva (desktop, tablet e celular), com estados de carregamento, lista vazia e erro.

## Banco de dados

**requests**: `id`, `title`, `description`, `category`, `priority` (Baixa | Média | Alta), `status` (Aberta | Em andamento | Concluída), `created_at`, `updated_at`.

**status_history**: `id`, `request_id` (FK para `requests`), `previous_status`, `new_status`, `changed_at`.

## Exemplos de uso

```bash
# Criar
curl -X POST http://localhost:3001/api/requests -H "Content-Type: application/json" \
  -d '{"title":"Notebook não liga","description":"Não inicia","category":"Suporte de TI","priority":"Alta"}'

# Filtrar
curl "http://localhost:3001/api/requests?status=Aberta&priority=Alta&search=notebook&sort=oldest"

# Avançar status
curl -X PATCH http://localhost:3001/api/requests/1/status -H "Content-Type: application/json" \
  -d '{"status":"Em andamento"}'

# Tentar saltar etapa (retorna 400)
curl -X PATCH http://localhost:3001/api/requests/2/status -H "Content-Type: application/json" \
  -d '{"status":"Concluída"}'
```

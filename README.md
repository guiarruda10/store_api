---

# API Backend - Loja Online (Estilo Mercado Livre)

Este projeto é uma API RESTful desenvolvida em **Node.js** com **TypeScript** e **Express**, que simula o backend de uma plataforma de e-commerce baseada no modelo de marketplaces como o Mercado Livre.
Oferece funcionalidades completas para autenticação, gestão de usuários, anúncios, categorias e localização.

---

## Tecnologias Utilizadas

* Node.js
* TypeScript
* Express.js
* MongoDB
* JWT (JSON Web Tokens)
* Middleware de autenticação
* Validação de dados

---

## Estrutura dos Endpoints

### 1. Health Check

* `GET /ping`
  Verifica se o servidor está em funcionamento.
  **Resposta esperada:**

  ```json
  { "pong": true }
  ```

---

### 2. Autenticação

* `POST /user/signin`
  Login de usuário.
  **Body esperado:**

  ```json
  {
    "email": "exemplo@email.com",
    "password": "senha123"
  }
  ```

* `POST /user/signup`
  Cadastro de novo usuário.
  **Body esperado:**

  ```json
  {
    "name": "Nome do usuário",
    "email": "exemplo@email.com",
    "password": "senha123",
    "state": "ID do estado"
  }
  ```

---

### 3. Usuário

* `GET /user/me`
  Retorna informações do usuário autenticado.
  **Requer token JWT**

* `PUT /user/me`
  Atualiza dados do usuário autenticado.
  **Requer token JWT**
  **Body opcional:** `name`, `email`, `password`, `state`

---

### 4. Localização

* `GET /states`
  Retorna a lista de estados disponíveis.

---

### 5. Categorias

* `GET /categories`
  Lista todas as categorias de produtos disponíveis.

---

### 6. Anúncios

* `POST /ad/add`
  Cria um novo anúncio.
  **Requer token JWT**
  **Body esperado:**

  ```json
  {
    "title": "Produto",
    "price": 99.99,
    "category": "ID da categoria",
    "description": "Detalhes do produto",
    "images": [ ... ]
  }
  ```

* `GET /ad/list`
  Lista anúncios com filtros opcionais (categoria, estado, preço etc.)

* `GET /ad/item`
  Retorna os detalhes de um anúncio específico.
  **Query param:** `?id=ID_DO_ANUNCIO`

* `POST /ad/:id`
  Edita os dados de um anúncio específico.
  **Requer token JWT**

---

## Autenticação

A autenticação utiliza **JSON Web Tokens (JWT)**.
O token deve ser enviado no header das requisições autenticadas:

```
Authorization: Bearer SEU_TOKEN_AQUI
```

---

## Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto com as seguintes configurações:

```env
PORT=3000
BASE=http://localhost:3000
DATABASE=mongodb://127.0.0.1:27017/store
JWT_SECRET=sua_chave_secreta_aqui
```

### Descrição

* `PORT`: Porta na qual a API será executada.
* `BASE`: URL base da aplicação.
* `DATABASE`: String de conexão com o banco MongoDB.
* `JWT_SECRET`: Chave secreta para geração e validação dos tokens JWT.

> Importante: Nunca exponha o arquivo `.env` em repositórios públicos.
> Adicione-o ao `.gitignore`.

---

## Estrutura de Diretórios

```
/controllers     → Lógica dos endpoints
/middlewares     → Autenticação e validações
/validators      → Regras de validação dos dados
/routes          → Definição das rotas da API
```

---

## Requisitos para Executar

* Node.js (versão 18 ou superior)
* MongoDB local ou em nuvem
* Arquivo `.env` corretamente configurado

---

## Instalação e Execução

```bash
# Instale as dependências
npm install

# Inicie o servidor em modo desenvolvimento
npm start
```

---

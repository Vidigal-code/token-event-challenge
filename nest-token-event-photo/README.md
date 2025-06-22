# NestJS API: Authentication & S3 Image Uploads

<p align="center">
  <img src="https://img.shields.io/badge/nestjs-%23E0234E.svg?style=for-the-badge&logo=nestjs&logoColor=white" alt="NestJS">
  <img src="https://img.shields.io/badge/MongoDB-%2347A248.svg?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB">
  <img src="https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white" alt="Docker">
  <img src="https://img.shields.io/badge/AWS S3-%23569A31.svg?style=for-the-badge&logo=amazon-s3&logoColor=white" alt="AWS S3">
  <img src="https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
</p>

---

## 📖 Sobre o Projeto / About The Project

<details>
<summary><strong>🇧🇷 Descrição em Português</strong></summary>
<br>
Este é um projeto backend robusto construído com <strong>NestJS</strong>, projetado para servir como uma base sólida e segura para aplicações modernas. A arquitetura implementa um sistema de autenticação de ponta a ponta com <strong>Access Tokens (JWT)</strong> e <strong>Refresh Tokens criptografados (JWE)</strong>, garantindo máxima segurança e uma excelente experiência de usuário através de rotação de tokens.

O projeto inclui um serviço desacoplado para upload e streaming de imagens para um bucket <strong>AWS S3</strong> (simulado localmente com <strong>LocalStack</strong>), com gerenciamento de metadados em um banco de dados <strong>MongoDB</strong>. Toda a infraestrutura (aplicação, banco de dados e serviços AWS) é orquestrada com <strong>Docker</strong> e <strong>Docker Compose</strong>, permitindo que o ambiente de desenvolvimento completo seja iniciado com um único comando.
</details>

<details>
<summary><strong>🇬🇧 English Description</strong></summary>
<br>
This is a robust backend project built with <strong>NestJS</strong>, designed to serve as a solid and secure foundation for modern applications. The architecture implements an end-to-end authentication system featuring <strong>Access Tokens (JWT)</strong> and <strong>encrypted Refresh Tokens (JWE)</strong>, ensuring maximum security and a great user experience through token rotation.

The project includes a decoupled service for uploading and streaming images to an <strong>AWS S3</strong> bucket (simulated locally with <strong>LocalStack</strong>), with metadata management in a <strong>MongoDB</strong> database. The entire infrastructure (application, database, and AWS services) is orchestrated with <strong>Docker</strong> and <strong>Docker Compose</strong>, allowing the complete development environment to be started with a single command.
</details>

---

## ✨ Funcionalidades Principais / Key Features

<details>
<summary><strong>🇧🇷 Detalhes das Funcionalidades</strong></summary>
<br>

-   #### **Autenticação e Autorização Avançadas**:
    -   **Access Tokens (JWT)**: Tokens de curta duração (`15m`) para autenticar requisições.
    -   **Refresh Tokens (JWE)**: Tokens de longa duração (`7d`) e criptografados (JSON Web Encryption) para proteger seu conteúdo, aumentando a segurança.
    -   **Armazenamento Seguro de Tokens**: Utiliza cookies `HttpOnly`, `Secure`, e `SameSite=Strict` para mitigar riscos de XSS.
    -   **Rotação de Tokens (Token Rotation)**: A cada requisição de `refresh`, o refresh token antigo é invalidado e um novo par de tokens é emitido, prevenindo o reuso de tokens roubados.
    -   **Logout Seguro no Servidor**: A invalidação do refresh token ocorre no banco de dados, garantindo que a sessão seja terminada de forma definitiva.
    -   **Controle de Acesso por Papel (RBAC)**: Proteção de rotas com o decorador `@Roles` e um `RolesGuard` customizado, permitindo permissões granulares (`admin`, `user`).
    -   **Hashing de Senhas**: Utiliza `bcrypt` para armazenar senhas de forma segura, prevenindo ataques de rainbow table.

-   #### **Gerenciamento de Imagens Desacoplado e Performático**:
    -   **Upload de Imagens (Base64)**: Endpoint simplificado que aceita imagens em formato base64.
    -   **Integração com AWS S3**: Armazena arquivos de forma desacoplada em um bucket S3 (simulado com **LocalStack**).
    -   **Recuperação de Imagens**: As imagens são lidas via fluxo e retornadas como strings codificadas em base64 usando a interface `Base64ImageResponse`. Essa abordagem minimiza o uso de memória do servidor, tornando-a ideal para lidar com arquivos grandes de forma eficiente.
    -   **Operações Resilientes**: Implementa lógica de retentativas para uploads e downloads do S3, lidando com falhas transitórias de rede ou serviço.

-   #### **Práticas de Segurança Robustas**:
    -   **Proteção contra CSRF**: Middleware (`CsrfMiddleware`) implementa o padrão *Double Submit Cookie* para proteger todas as rotas que alteram estado.
    -   **Sanitização de Inputs**: Um `SanitizeInputInterceptor` global remove tags HTML de todos os inputs do corpo da requisição para prevenir ataques de XSS e injeção de HTML.
    -   **Rate Limiting (Throttling)**: Protege a API contra ataques de força bruta e negação de serviço, limitando o número de requisições por IP.
    -   **Validação de Dados**: Garante a integridade e o formato dos dados de entrada com `class-validator` e DTOs, rejeitando payloads malformados.
    -   **Cabeçalhos de Segurança**: Utiliza `helmet` para configurar cabeçalhos HTTP seguros (CSP, X-Frame-Options, etc.).

</details>

<details>
<summary><strong>🇬🇧 Feature Details</strong></summary>
<br>

-   #### **Advanced Authentication & Authorization**:
    -   **JWT Access Tokens**: Short-lived tokens (`15m`) for authenticating requests.
    -   **JWE Refresh Tokens**: Long-lived (`7d`), encrypted (JSON Web Encryption) tokens to protect their content, enhancing security.
    -   **Secure Token Storage**: Uses `HttpOnly`, `Secure`, and `SameSite=Strict` cookies to mitigate XSS risks.
    -   **Token Rotation**: Upon each `refresh` request, the old refresh token is invalidated, and a new token pair is issued, preventing the reuse of stolen tokens.
    -   **Secure Server-Side Logout**: Invalidation of the refresh token occurs in the database, ensuring the session is terminated definitively.
    -   **Role-Based Access Control (RBAC)**: Protects routes using a custom `@Roles` decorator and a `RolesGuard`, allowing for granular permissions (`admin`, `user`).
    -   **Password Hashing**: Uses `bcrypt` to securely store passwords, preventing rainbow table attacks.

-   #### **Decoupled and Performant Image Management**:
    -   **Base64 Image Upload**: A simplified endpoint that accepts images in base64 format.
    -   **AWS S3 Integration**: Stores files in a decoupled manner in an S3 bucket (simulated with **LocalStack**).
    - **Image Retrieval**: Images are read via stream and returned as base64-encoded strings using the `Base64ImageResponse` interface. This approach minimizes server memory usage, making it ideal for handling large files efficiently.
    -   **Resilient Operations**: Implements retry logic for S3 uploads and downloads to handle transient network or service failures.

-   #### **Robust Security Practices**:
    -   **CSRF Protection**: A `CsrfMiddleware` implements the *Double Submit Cookie* pattern to protect all state-changing routes.
    -   **Input Sanitization**: A global `SanitizeInputInterceptor` strips HTML tags from all request body inputs to prevent XSS and HTML injection attacks.
    -   **Rate Limiting (Throttling)**: Protects the API against brute-force and denial-of-service attacks by limiting the number of requests per IP.
    -   **Data Validation**: Ensures the integrity and format of incoming data with `class-validator` and DTOs, rejecting malformed payloads.
    -   **Security Headers**: Uses `helmet` to configure secure HTTP headers (CSP, X-Frame-Options, etc.).

</details>

---

## 🛠️ Tecnologias Utilizadas / Tech Stack

| Categoria / Category | Tecnologia / Technology                                                                                                                              |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Backend**          | [NestJS](https://nestjs.com/), [TypeScript](https://www.typescriptlang.org/)                                                                          |
| **Banco de Dados**   | [MongoDB](https://www.mongodb.com/) com [Mongoose](https://mongoosejs.com/)                                                                            |
| **Autenticação**     | [JWT](https://jwt.io/) (`@nestjs/jwt`), [JWE](https://github.com/panva/jose) (`jose`), [CSRF](https://github.com/Psifi-Solutions/csrf-csrf) (`csrf-csrf`) |
| **Armazenamento**    | [AWS S3](https://aws.amazon.com/s3/) (simulado com [LocalStack](https://localstack.cloud/))                                                          |
| **Containerização**  | [Docker](https://www.docker.com/), [Docker Compose](https://docs.docker.com/compose/)                                                               |
| **Segurança**        | `bcrypt`, `helmet`, `nestjs-throttler`, `sanitize-html`                                                                                               |
| **Validação**        | `class-validator`, `class-transformer`                                                                                                               |

---

## 🚀 Como Executar / Getting Started

### Pré-requisitos / Prerequisites

-   [Docker](https://www.docker.com/get-started) instalado e em execução.
-   [Docker Compose](https://docs.docker.com/compose/install/) instalado.

### Passos para Instalação / Installation Steps

1.  **Clone o repositório / Clone the repository:**
    ```sh
    git clone https://github.com/token-event-challenge/nest-token-event-photo.git
    cd nest-token-event-photo
    ```

2.  **Crie o arquivo de ambiente / Create the environment file:**
    -   O `.env` fornecido no repositório já está configurado para o ambiente Docker. Se ele não existir, copie o exemplo:
        ```sh
        # Se o arquivo .env não existir / If the .env file does not exist
        cp .env.example .env
        ```
    -   **Importante**: Para um ambiente de produção, é **crucial** substituir `JWT_SECRET`, `JWE_SECRET` e `CSRF_SECRET` por valores longos, seguros e aleatórios gerados criptograficamente.
    -   **Important**: For a production environment, you **must** replace `JWT_SECRET`, `JWE_SECRET`, and `CSRF_SECRET` with long, secure, cryptographically-generated random values.

3.  **Inicie os serviços com Docker Compose / Start the services with Docker Compose:**
    -   Execute o comando a seguir na raiz do projeto. Ele irá construir a imagem da aplicação e iniciar todos os contêineres.
        ```sh
        docker-compose up --build
        ```

4.  **Pronto! / You're all set!**
    -   A API estará disponível em: `http://localhost:3001`
    -   O serviço S3 (LocalStack) estará em: `http://localhost:4566`
    -   O MongoDB estará em: `mongodb://localhost:27017`

---

## 🔑 Variáveis de Ambiente / Environment Variables

<details>
<summary>Expandir para ver detalhes / Expand to see details</summary>
<br>

| Variável / Variable             | Descrição / Description                                                                                             | Valor Padrão no `.env` / Default Value in `.env` |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| `MONGODB_URI`                   | 🇧🇷 URI de conexão com o MongoDB. <br/> 🇬🇧 MongoDB connection URI.                                                   | `mongodb://mongodb:27017/nextlab`                |
| `JWT_SECRET`                    | **🇧🇷 (CRÍTICO)** Segredo para assinar tokens JWT. <br/> **🇬🇧 (CRITICAL)** Secret for signing JWTs.                     | `(A long random hex string)`                     |
| `JWE_SECRET`                    | **🇧🇷 (CRÍTICO)** Segredo para criptografar tokens JWE. <br/> **🇬🇧 (CRITICAL)** Secret for encrypting JWEs.            | `test145820`                                     |
| `CSRF_SECRET`                   | **🇧🇷 (CRÍTICO)** Segredo para proteção CSRF. <br/> **🇬🇧 (CRITICAL)** Secret for CSRF protection.                       | `test14582082`                                   |
| `JWT_EXPIRES_IN`                | 🇧🇷 Tempo de expiração do Access Token (formato `ms`). <br/> 🇬🇧 Access Token expiration time (`ms` format).           | `15m`                                            |
| `REFRESH_TOKEN_EXPIRES_IN`      | 🇧🇷 Tempo de expiração do Refresh Token (formato `ms`). <br/> 🇬🇧 Refresh Token expiration time (`ms` format).        | `7d`                                             |
| `JWT_EXPIRES_IN_MS`             | 🇧🇷 Expiração do Access Token em milissegundos. <br/> 🇬🇧 Access Token expiration in milliseconds.                     | `900000`                                         |
| `REFRESH_TOKEN_EXPIRES_IN_MS`   | 🇧🇷 Expiração do Refresh Token em milissegundos. <br/> 🇬🇧 Refresh Token expiration in milliseconds.                   | `604800000`                                      |
| `S3_ENDPOINT`                   | 🇧🇷 Endpoint do serviço S3 (LocalStack). <br/> 🇬🇧 S3 service endpoint (LocalStack).                                   | `http://localstack:4566`                         |
| `S3_BUCKET`                     | 🇧🇷 Nome do bucket S3 para armazenar imagens. <br/> 🇬🇧 Name of the S3 bucket to store images.                           | `image-bucket`                                   |
| `PORT`                          | 🇧🇷 Porta onde a aplicação NestJS irá rodar. <br/> 🇬🇧 Port on which the NestJS application will run.                 | `3001`                                           |
| `API_FRONT_END`                 | 🇧🇷 URL do front-end para configuração de CORS. <br/> 🇬🇧 Front-end URL for CORS configuration.                         | `http://localhost:3000`                          |

</details>

---

## ↔️ Endpoints da API / API Endpoints

<details>
<summary>Ver Endpoints / Show Endpoints</summary>
<br>

### Autenticação / Authentication (`/auth`)

| Método / Method | Rota / Route     | Descrição / Description                                                                                                    | Proteção / Protection               |
| :-------------- | :--------------- | :------------------------------------------------------------------------------------------------------------------------- | :---------------------------------- |
| `POST`          | `/register`      | 🇧🇷 Registra um novo usuário. <br/> 🇬🇧 Registers a new user.                                                                  | CSRF                                |
| `POST`          | `/login`         | 🇧🇷 Autentica um usuário e retorna tokens. <br/> 🇬🇧 Authenticates a user and returns tokens.                                     | CSRF                                |
| `POST`          | `/refresh`       | 🇧🇷 Gera novos tokens usando o refresh token do cookie. <br/> 🇬🇧 Issues new tokens using the refresh token from the cookie.        | CSRF                                |
| `POST`          | `/logout`        | 🇧🇷 Desloga o usuário invalidando o refresh token. <br/> 🇬🇧 Logs out the user by invalidating the refresh token.                  | CSRF                                |
| `POST`          | `/password`      | 🇧🇷 Atualiza a senha do usuário autenticado. <br/> 🇬🇧 Updates the authenticated user's password.                                  | CSRF + JWT (User/Admin)             |
| `GET`           | `/admin`         | 🇧🇷 Rota de exemplo para acesso de administrador. <br/> 🇬🇧 Example route for administrator-only access.                             | JWT (Admin Only)                    |

### Imagem / Image (`/image`)

| Método / Method | Rota / Route          | Descrição / Description                                                                                                | Proteção / Protection |
| :-------------- | :-------------------- | :--------------------------------------------------------------------------------------------------------------------- | :-------------------- |
| `POST`          | `/image`              | 🇧🇷 Salva uma imagem (base64) no S3. <br/> 🇬🇧 Saves an image (base64) to S3.                                              | Público / Public      |
| `GET`           | `/image/qr/:qrCodeId` | 🇧🇷 Recupera uma imagem pelo seu `qrCodeId` como um stream. <br/> 🇬🇧 Retrieves an image by its `qrCodeId` as a stream.        | Público / Public      |

</details>

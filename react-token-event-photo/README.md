# React Photo Booth Event App / Aplicação de Cabine de Fotos para Eventos

This project is a fully interactive photo booth application designed for events. It includes a user-facing photo capture
flow and a secure, role-based admin panel for photo management.

---

### 📦 Example `.env` for Docker Development

```env
VITE_API_BACK_END=https://192.168.0.13:3001
```

<details>
<summary><strong>🇬🇧 English Description</strong></summary>
<br>

## ✨ Key Features

- **Interactive Photo Flow**: A complete, touch-friendly user journey: Start -> Pre-Capture -> Countdown -> Branded
  Photo -> QR Code Download.
- **Automatic Branding**: Automatically applies a custom frame and branding to every photo taken.
- **QR Code Download**: Generates a unique QR code for each photo, allowing users to easily download their pictures on
  their own devices.
- **Secure Authentication**: Features user registration and login, protecting sensitive routes.
- **CSRF Protection**: Implements CSRF tokens to secure all state-changing actions (login, register, delete, etc.).
- **Role-Based Admin Panel**:
    - **Admin View**: Admins can view and delete all photos taken by any user.
    - **User View**: Logged-in users can view and delete only their own photos.
- **Responsive Design**: Styled with Tailwind CSS for a clean and responsive interface that works on touchscreens and
  mobile devices.
- **Direct Photo Preview**: The QR code links to a dedicated preview page where the user can view and download their
  image.

## 🚀 Application Flow

The participant experience is designed to be fast and intuitive:

1. **Initial Screen**: A welcoming start screen with a "Start" button. It also provides options to "Login" or "Register"
   for administrative access.
2. **Pre-Capture Screen**: Shows a live feed from the user's webcam with a large capture button.
3. **Countdown**: A 3-second countdown is displayed over the webcam feed to prepare the user for the photo.
4. **Photo Processing**: The photo is captured, and a branding frame (logo and text) is automatically applied to it.
5. **Review Screen**: The user can review the final photo and choose to approve it or retry.
6. **Final Screen**: Upon approval, the final image is displayed along with a unique QR code. The application
   automatically sends the image data to the backend.
7. **Auto-Reset**: After a 30-second timeout, the application automatically returns to the Initial Screen, ready for the
   next participant.

## 🛠️ Technology Stack

- **Frontend**: React, TypeScript, Vite
- **Routing**: React Router
- **HTTP Client**: Axios (for secure, credentialed API requests)
- **Styling**: Tailwind CSS
- **Camera Access**: `react-webcam`
- **QR Code Generation**: `qrcode`
- **Unique IDs**: `uuid`

## ⚙️ Backend API Endpoints

The frontend is designed to communicate with a backend that exposes the following endpoints:

- `POST /auth/register`: Register a new user.
- `POST /auth/login`: Log in a user and start a session.
- `POST /auth/logout`: Log out the user.
- `GET /auth/check`: Check if the current user is authenticated.
- `GET /auth/csrf`: Obtain a CSRF token for secure requests.
- `POST /image`: Upload a new, base64-encoded image with its metadata.
- `GET /image/all`: **(Admin)** Get a list of all images.
- `GET /image/user`: **(User)** Get a list of images belonging to the authenticated user.
- `GET /image/qr/:qrCodeId`: Get the base64 data for a specific image to preview/download.
- `DELETE /image/qr/:qrCodeId`: **(Admin)** Delete an image.
- `DELETE /image/user/qr/:qrCodeId`: **(User)** Delete an image owned by the user.

## 📦 Project Setup and Installation

To run this project locally, follow these steps:

1. **Clone the repository:**
   ```bash
     git clone https://github.com/token-event-challenge/react-token-event-photo.git
     cd react-token-event-photo
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env` file in the project root and add the base URL for your backend API.
   ```env
   VITE_API_BACK_END=https://your-backend-api-url:port
   ```
   For local testing, this might be `https://localhost:3001` or an IP address like `https://192.168.0.13:3001`.

4. **Local SSL (Optional but Recommended):**
   The Vite configuration is set up to use HTTPS, which is required for camera access on most modern browsers. The
   project looks for SSL certificates in an `ssl/` directory. If you don't have them, you can generate self-signed
   certificates.

5. **Run the development server:**
   ```bash
   npm run dev
   ```
   The application will be available at `https://localhost:3000` (or the configured host).

6. **Build for production:**
   ```bash
   npm run build
   ```
   This command compiles the TypeScript and React code and bundles it for production in the `dist/` directory.

</details>

<details>
<summary><strong>🇧🇷 Descrição em Português</strong></summary>
<br>

## ✨ Principais Funcionalidades

- **Fluxo de Foto Interativo**: Uma jornada de usuário completa e amigável ao toque: Iniciar -> Pré-Captura -> Contagem
  Regressiva -> Foto com Marca -> Download por QR Code.
- **Branding Automático**: Aplica automaticamente uma moldura personalizada e a marca do cliente em cada foto tirada.
- **Download por QR Code**: Gera um QR code exclusivo para cada foto, permitindo que os usuários baixem facilmente suas
  imagens em seus próprios dispositivos.
- **Autenticação Segura**: Possui registro e login de usuário, protegendo rotas sensíveis.
- **Proteção CSRF**: Implementa tokens CSRF para proteger todas as ações que alteram o estado (login, registro,
  exclusão, etc.).
- **Painel Administrativo Baseado em Permissões**:
    - **Visão de Admin**: Administradores podem visualizar e excluir todas as fotos tiradas por qualquer usuário.
    - **Visão de Usuário**: Usuários logados podem visualizar e excluir apenas suas próprias fotos.
- **Design Responsivo**: Estilizado com Tailwind CSS para uma interface limpa e responsiva que funciona em telas de
  toque e dispositivos móveis.
- **Visualização Direta da Foto**: O QR code leva a uma página de visualização dedicada, onde o usuário pode ver e
  baixar sua imagem.

## 🚀 Fluxo da Aplicação

A experiência do participante foi projetada para ser rápida e intuitiva:

1. **Tela Inicial**: Uma tela de boas-vindas com um botão "Iniciar". Ela também oferece opções para "Login" ou "
   Registrar" para acesso administrativo.
2. **Tela de Pré-Captura**: Mostra uma transmissão ao vivo da webcam do usuário com um grande botão de captura.
3. **Contagem Regressiva**: Uma contagem regressiva de 3 segundos é exibida sobre a imagem da webcam para preparar o
   usuário para a foto.
4. **Processamento da Foto**: A foto é capturada e uma moldura de branding (logo e texto) é aplicada automaticamente.
5. **Tela de Revisão**: O usuário pode revisar a foto final e escolher aprová-la ou tentar novamente.
6. **Tela Final**: Após a aprovação, a imagem final é exibida junto com um QR code exclusivo. A aplicação envia
   automaticamente os dados da imagem para o backend.
7. **Reinício Automático**: Após um tempo de espera de 30 segundos, a aplicação retorna automaticamente para a Tela
   Inicial, pronta para o próximo participante.

## 🛠️ Tecnologias Utilizadas

- **Frontend**: React, TypeScript, Vite
- **Roteamento**: React Router
- **Cliente HTTP**: Axios (para requisições API seguras e com credenciais)
- **Estilização**: Tailwind CSS
- **Acesso à Câmera**: `react-webcam`
- **Geração de QR Code**: `qrcode`
- **IDs Únicos**: `uuid`

## ⚙️ Endpoints da API (Backend)

O frontend foi projetado para se comunicar com um backend que expõe os seguintes endpoints:

- `POST /auth/register`: Registra um novo usuário.
- `POST /auth/login`: Realiza o login de um usuário e inicia uma sessão.
- `POST /auth/logout`: Desloga o usuário.
- `GET /auth/check`: Verifica se o usuário atual está autenticado.
- `GET /auth/csrf`: Obtém um token CSRF para requisições seguras.
- `POST /image`: Envia uma nova imagem codificada em base64 com seus metadados.
- `GET /image/all`: **(Admin)** Obtém uma lista de todas as imagens.
- `GET /image/user`: **(Usuário)** Obtém uma lista de imagens pertencentes ao usuário autenticado.
- `GET /image/qr/:qrCodeId`: Obtém os dados em base64 de uma imagem específica para visualização/download.
- `DELETE /image/qr/:qrCodeId`: **(Admin)** Exclui uma imagem.
- `DELETE /image/user/qr/:qrCodeId`: **(Usuário)** Exclui uma imagem de propriedade do usuário.

## 📦 Configuração e Instalação Local

Para executar este projeto localmente, siga estes passos:

1. **Clone o repositório:**
   ```bash
     git clone https://github.com/token-event-challenge/react-token-event-photo.git
     cd react-token-event-photo
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente:**
   Crie um arquivo `.env` na raiz do projeto e adicione a URL base da sua API de backend.
   ```env
   VITE_API_BACK_END=https://sua-url-de-api-backend:porta
   ```
   Para testes locais, isso pode ser `https://localhost:3001` ou um endereço IP como `https://192.168.0.13:3001`.

4. **SSL Local (Opcional, mas Recomendado):**
   A configuração do Vite está preparada para usar HTTPS, que é necessário para o acesso à câmera na maioria dos
   navegadores modernos. O projeto procura por certificados SSL em um diretório `ssl/`. Se você não os tiver, pode gerar
   certificados autoassinados.

5. **Execute o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```
   A aplicação estará disponível em `https://localhost:3000` (ou no host configurado).

6. **Compile para produção:**
   ```bash
   npm run build
   ```
   Este comando compila o código TypeScript e React e o empacota para produção no diretório `dist/`.

</details>
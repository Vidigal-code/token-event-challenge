# React Photo Booth App

> **Note:** This is the **Serverless Variant** of the [event-token-photo Monorepo](../README.md). It runs entirely on the client-side (GitHub Pages) and uses [Supabase](https://supabase.com/) for backend services.


<p align="center">
  <img alt="React" src="https://img.shields.io/badge/React-19.1.0-blue?style=for-the-badge&logo=react">
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5.8.3-blue?style=for-the-badge&logo=typescript">
  <img alt="Vite" src="https://img.shields.io/badge/Vite-6.3.5-purple?style=for-the-badge&logo=vite">
  <img alt="Supabase" src="https://img.shields.io/badge/Supabase-2.50.0-green?style=for-the-badge&logo=supabase">
  <img alt="TailwindCSS" src="https://img.shields.io/badge/Tailwind_CSS-4.1.10-cyan?style=for-the-badge&logo=tailwindcss">
</p>

<div align="center">
  <a href="https://vidigal-code.github.io/token-event-challenge">
    <strong>» Check out the Live Demo «</strong>
  </a>
</div>
<br>

<details>
<summary><strong>🇬🇧 English Description</strong></summary>
<br>

## 📋 About The Project

This is an interactive web-based photo booth application designed for events. Users can take a picture using their device's webcam, which is then automatically branded with a custom logo and text. After approving the photo, a unique QR code is generated, allowing users to easily download the final image to their own devices.
The project is built with a modern tech stack including React, TypeScript, and Tailwind CSS, and it uses Supabase for cloud image storage.

### ✨ Features

-   **Live Webcam Feed:** Real-time camera preview for perfect posing.
-   **Photo Capture:** Simple one-click photo-taking with a countdown.
-   **Automatic Branding:** A custom logo and text are automatically added to every photo.
-   **Review & Retry:** Users can review their photo and choose to retake it if they're not satisfied.
-   **QR Code Generation:** A unique QR code is generated for each approved photo for easy sharing.
-   **Easy Download:** Scanning the QR code leads to a dedicated page to view and download the image.
-   **Cloud Storage:** Photos are securely uploaded to Supabase Storage.
-   **Responsive Design:** Optimized for a portrait, mobile-like experience, perfect for kiosks and event stands.

### ⚙️ How It Works

The user flow is designed to be simple and intuitive:
1.  **Start:** The user begins on a welcome screen and clicks "Iniciar" (Start).
2.  **Pose:** The application switches to a live webcam view where the user can pose for their photo.
3.  **Capture:** Clicking the shutter button initiates a 3-second countdown.
4.  **Process:** The photo is captured, and the branding (logo and text) is programmatically applied to the image using an HTML Canvas.
5.  **Review:** The final, branded photo is displayed. The user can either "Aprovar" (Approve) or "Refazer" (Retry).
6.  **Upload & QR Code:** Upon approval, the image is uploaded to the cloud, and a screen appears with the photo and a unique QR code.
7.  **Download:** The user scans the QR code with their phone, which opens a new page where they can download their photo. The booth automatically resets for the next user after 30 seconds.

### 🛠️ Technology Stack

-   **Frontend:** React, Vite, TypeScript
-   **Styling:** Tailwind CSS
-   **Routing:** React Router (`HashRouter` for GitHub Pages compatibility)
-   **Camera:** `react-webcam`
-   **QR Code:** `qrcode`
-   **Backend & Storage:** Supabase Storage
-   **Unique IDs:** `uuid`

### 🚀 Setup and Local Installation

To run this project locally, follow these steps:

1.  **Prerequisites:** Make sure you have Node.js and npm (or yarn) installed.

2.  **Clone the repository:**
    ```bash
    git clone https://github.com/Vidigal-code/token-event-challenge/token-event-photo-git-pages.git
    cd token-event-photo-git-pages
    ```

3.  **Install dependencies:**
    ```bash
    npm install
    ```

4.  **Configure Supabase:**
    -   Create a free account at [supabase.com](https://supabase.com).
    -   Create a new project.
    -   In your project, go to the **Storage** section and create a new **public bucket** named `photos`.
    -   Navigate to **Project Settings > API**.
    -   Copy the **Project URL** and the **`anon` public key**.
    -   Paste these values into the `src/supabase/gitpage-config.ts` file:
        ```typescript
        const supabaseUrl = 'YOUR_SUPABASE_URL';
        const supabaseKey = 'YOUR_SUPABASE_ANON_KEY';
        ```
    > **Security Note:** For a real production application, it is highly recommended to use environment variables (`.env` file) to store these keys instead of hardcoding them.

5.  **Run the development server:**
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:5173` (or a similar address).

### 🌐 Deployment

This project is configured for easy deployment to GitHub Pages.
1.  Ensure the `homepage` property in `package.json` is set to your GitHub Pages URL.
2.  Run the deployment script:
    ```bash
    npm run deploy
    ```
    This script will first build the project and then push the contents of the `dist` folder to the `gh-pages` branch of your repository.

### ✍️ Author

Created by [Kauan Vidigal (Vidigal-code)](https://github.com/Vidigal-code).
</details>

<br>

<details>
<summary><strong>🇧🇷 Descrição em Português</strong></summary>
<br>

## 📋 Sobre o Projeto

Esta é uma aplicação web interativa de cabine fotográfica (photobooth) projetada para eventos. Os usuários podem tirar uma foto usando a webcam do dispositivo, que é automaticamente personalizada com um logo e texto. Após aprovar a foto, um QR code exclusivo é gerado, permitindo que os usuários baixem facilmente a imagem final para seus próprios dispositivos.

O projeto foi construído com uma stack de tecnologias modernas, incluindo React, TypeScript e Tailwind CSS, e utiliza o Supabase para armazenamento de imagens na nuvem.

### ✨ Funcionalidades

-   **Feed da Webcam ao Vivo:** Pré-visualização da câmera em tempo real para a pose perfeita.
-   **Captura de Foto:** Tirar fotos com um simples clique e uma contagem regressiva.
-   **Branding Automático:** Um logo e texto personalizados são adicionados automaticamente a cada foto.
-   **Revisão e Nova Tentativa:** Os usuários podem revisar sua foto e optar por tirá-la novamente se não estiverem satisfeitos.
-   **Geração de QR Code:** Um QR code exclusivo é gerado para cada foto aprovada para compartilhamento fácil.
-   **Download Fácil:** Escanear o QR code leva a uma página dedicada para visualizar e baixar a imagem.
-   **Armazenamento em Nuvem:** As fotos são enviadas de forma segura para o Supabase Storage.
-   **Design Responsivo:** Otimizado para uma experiência de tela vertical (retrato), ideal para totens e estandes de eventos.

### ⚙️ Como Funciona

O fluxo do usuário foi projetado para ser simples e intuitivo:
1.  **Iniciar:** O usuário começa em uma tela de boas-vindas e clica em "Iniciar".
2.  **Pose:** A aplicação muda para a visualização da webcam ao vivo, onde o usuário pode posar para a foto.
3.  **Captura:** Clicar no botão do obturador inicia uma contagem regressiva de 3 segundos.
4.  **Processamento:** A foto é capturada, e a personalização (logo e texto) é aplicada programaticamente à imagem usando um Canvas HTML.
5.  **Revisão:** A foto final com a marca é exibida. O usuário pode "Aprovar" ou "Refazer".
6.  **Upload e QR Code:** Após a aprovação, a imagem é enviada para a nuvem, e uma tela aparece com a foto e um QR code exclusivo.
7.  **Download:** O usuário escaneia o QR code com seu celular, o que abre uma nova página onde pode baixar sua foto. A cabine reinicia automaticamente para o próximo usuário após 30 segundos.

### 🛠️ Tecnologias Utilizadas

-   **Frontend:** React, Vite, TypeScript
-   **Estilização:** Tailwind CSS
-   **Roteamento:** React Router (`HashRouter` para compatibilidade com GitHub Pages)
-   **Câmera:** `react-webcam`
-   **QR Code:** `qrcode`
-   **Backend e Armazenamento:** Supabase Storage
-   **IDs Únicos:** `uuid`

### 🚀 Configuração e Instalação Local

Para executar este projeto localmente, siga estes passos:

1.  **Pré-requisitos:** Certifique-se de ter o Node.js e o npm (ou yarn) instalados.

2.  **Clone o repositório:**
    ```bash
    git clone https://github.com/Vidigal-code/token-event-challenge/token-event-photo-git-pages-and-supabase.git
    cd token-event-photo-git-pages-and-gitpages
    ```

3.  **Instale as dependências:**
    ```bash
    npm install
    ```

4.  **Configure o Supabase:**
    -   Crie uma conta gratuita em [supabase.com](https://supabase.com).
    -   Crie um novo projeto.
    -   No seu projeto, vá para a seção **Storage** e crie um novo **bucket público** chamado `photos`.
    -   Navegue até **Project Settings > API**.
    -   Copie a **URL do Projeto** e a **chave pública `anon`**.
    -   Cole esses valores no arquivo `src/supabase/gitpage-config.ts`:
        ```typescript
        const supabaseUrl = 'SUA_URL_SUPABASE';
        const supabaseKey = 'SUA_CHAVE_ANON_SUPABASE';
        ```
    > **Nota de Segurança:** Para uma aplicação de produção real, é altamente recomendável usar variáveis de ambiente (arquivo `.env`) para armazenar essas chaves em vez de codificá-las diretamente.

5.  **Execute o servidor de desenvolvimento:**
    ```bash
    npm run dev
    ```
    A aplicação estará disponível em `http://localhost:5173` (ou um endereço semelhante).

### 🌐 Publicação (Deployment)

Este projeto está configurado para publicação fácil no GitHub Pages.
1.  Garanta que a propriedade `homepage` no arquivo `package.json` esteja configurada para a URL do seu GitHub Pages.
2.  Execute o script de deploy:
    ```bash
    npm run deploy
    ```
    Este script primeiro fará o build do projeto e, em seguida, enviará o conteúdo da pasta `dist` para a branch `gh-pages` do seu repositório.

### ✍️ Autor

Criado por [Kauan Vidigal (Vidigal-code)](https://github.com/Vidigal-code).
</details>

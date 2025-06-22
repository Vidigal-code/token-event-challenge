import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import fs from 'fs';
import path from 'path';

export default defineConfig({
  plugins: [
    tailwindcss(),
  ],
  server: {
    https: {
      key: fs.readFileSync(path.resolve(__dirname, 'ssl/fake-key.pem')),
      cert: fs.readFileSync(path.resolve(__dirname, 'ssl/fake.pem')),
    },
    host: true,
    port: 3000,
  },
})
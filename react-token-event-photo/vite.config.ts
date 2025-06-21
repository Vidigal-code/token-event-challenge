import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import fs from 'fs';
import path from 'path';

export default defineConfig({
  plugins: [
    tailwindcss(),
  ],
  /*server: {
    https: {
      key: fs.readFileSync(path.resolve(__dirname, 'ssl/192.168.0.13-key.pem')),
      cert: fs.readFileSync(path.resolve(__dirname, 'ssl/192.168.0.13.pem')),
    },
    host: '0.0.0.0',
    port: 3000,
  },*/
})
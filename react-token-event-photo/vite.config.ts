import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import fs from 'fs';
import path from 'path';

const keyPath = path.resolve(__dirname, 'ssl/fake-key.pem');
const certPath = path.resolve(__dirname, 'ssl/fake.pem');
const useLocalCertificate =
  process.env.LOCAL_CERTIFICATE === 'true' &&
  fs.existsSync(keyPath) &&
  fs.existsSync(certPath);

export default defineConfig({
  plugins: [
    tailwindcss(),
  ],
  server: {
    https: useLocalCertificate
      ? {
          key: fs.readFileSync(keyPath),
          cert: fs.readFileSync(certPath),
        }
      : undefined,
    host: true,
    port: 3000,
  },
})
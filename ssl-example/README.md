# SSL Example

## 🇧🇷 Português

Os certificados de teste deste diretório (`fake.txt` e `fake-key.txt`) são usados automaticamente pelo Docker Compose.

- No modo Docker, **não** é necessário renomear ou copiar arquivos manualmente.
- O compose monta:
  - `ssl-example/fake.txt` -> `nest-token-event-photo/ssl/fake.pem`
  - `ssl-example/fake-key.txt` -> `nest-token-event-photo/ssl/fake-key.pem`
  - `ssl-example/fake.txt` -> `react-token-event-photo/ssl/fake.pem`
  - `ssl-example/fake-key.txt` -> `react-token-event-photo/ssl/fake-key.pem`

Se você executar sem Docker e quiser HTTPS local, copie manualmente:

- `ssl-example/fake.txt` para `nest-token-event-photo/ssl/fake.pem`
- `ssl-example/fake-key.txt` para `nest-token-event-photo/ssl/fake-key.pem`
- `ssl-example/fake.txt` para `react-token-event-photo/ssl/fake.pem`
- `ssl-example/fake-key.txt` para `react-token-event-photo/ssl/fake-key.pem`

## 🇺🇸 English

The test certificates from this directory (`fake.txt` and `fake-key.txt`) are automatically used by Docker Compose.

- In Docker mode, there is **no** need to rename or copy files manually.
- Compose mounts:
  - `ssl-example/fake.txt` -> `nest-token-event-photo/ssl/fake.pem`
  - `ssl-example/fake-key.txt` -> `nest-token-event-photo/ssl/fake-key.pem`
  - `ssl-example/fake.txt` -> `react-token-event-photo/ssl/fake.pem`
  - `ssl-example/fake-key.txt` -> `react-token-event-photo/ssl/fake-key.pem`

If you run without Docker and want local HTTPS, copy manually:

- `ssl-example/fake.txt` to `nest-token-event-photo/ssl/fake.pem`
- `ssl-example/fake-key.txt` to `nest-token-event-photo/ssl/fake-key.pem`
- `ssl-example/fake.txt` to `react-token-event-photo/ssl/fake.pem`
- `ssl-example/fake-key.txt` to `react-token-event-photo/ssl/fake-key.pem`

<img src="https://github.com/Vidigal-code/token-event-challenge/blob/main/ssl-example/example-ssl-add-test.png?raw=true" alt="" width="800"/>


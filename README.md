# Welcome to React Router!

A modern, production-ready template for building full-stack React applications using React Router.

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/remix-run/react-router-templates/tree/main/default)

## Features

- 🚀 Server-side rendering
- ⚡️ Hot Module Replacement (HMR)
- 📦 Asset bundling and optimization
- 🔄 Data loading and mutations
- 🔒 TypeScript by default
- 🎉 TailwindCSS for styling
- 📖 [React Router docs](https://reactrouter.com/)

## Getting Started

### Installation

Install the dependencies:

```bash
npm install
```

### Development

Start the development server with HMR:

```bash
npm run dev
```

Your application will be available at `http://localhost:5173`.

## Database

For local development, set `DATABASE_URL`, then synchronize the current Drizzle schema:

```bash
npm run db:push
```

The beta Compose deployment runs this schema push automatically. The `db:migrate` command remains available for a future migration-based production workflow.

Homepage statistics trust the first value in `X-Forwarded-For`, then `X-Real-IP`. In production, the reverse proxy must overwrite these headers and the app server must not be directly reachable by clients.

## Building for Production

Create a production build:

```bash
npm run build
```

## Beta deployment on `new.hut.ac.ir`

The production Compose stack contains PostgreSQL, a one-shot Drizzle schema tool, the React Router SSR server, and Nginx. Only Nginx publishes host ports (`80` and `443`). Normal deployments preserve the PostgreSQL named volume, while `drizzle-kit push --force` may remove data affected by destructive schema changes.

### Server prerequisites

- Ubuntu with Git, OpenSSL, Docker Engine, and the current Docker Compose plugin
- Outbound access to GitHub and Docker Hub
- Ports 80 and 443 available on the server
- The deployment user able to run Docker without an interactive `sudo` prompt

Create the server directories and clone the public repository:

```bash
sudo install -d -o "$USER" -g "$USER" -m 0750 /opt/hut
sudo install -d -o "$USER" -g "$USER" -m 0700 /opt/hut/secrets/tls
sudo install -d -o "$USER" -g "$USER" -m 0700 /opt/hut/backups
git clone --branch main --single-branch https://github.com/SinaTZ0/hut-rr8-tw-temp.git /opt/hut/app
cd /opt/hut/app
```

### Environment

Create the server-only environment file and generate two different secrets:

```bash
cp .env.example .env
chmod 0600 .env
openssl rand -hex 32
openssl rand -hex 32
```

Edit `.env` and replace `POSTGRES_PASSWORD` and `ALTCHA_HMAC_SECRET` with those values. The `DATABASE_URL` entry is only for running Node/Drizzle directly outside Compose; Compose constructs its internal URL from the `POSTGRES_*` values.

### TLS certificate

Do not copy `ssl1405` into the Git repository or Docker image. On the server, create the Nginx chain from the wildcard leaf followed by the issuing intermediate, and install the matching private key:

```bash
(umask 077 && cat /path/to/ssl1405/wildcard_hut_ac_ir.crt /path/to/ssl1405/CACert.crt > /opt/hut/secrets/tls/fullchain.pem)
install -m 0600 /path/to/ssl1405/wildcard_hut_ac_ir.key /opt/hut/secrets/tls/privkey.pem
```

The current certificate covers `new.hut.ac.ir` and expires on **2026-11-24**. When the university supplies a replacement, rebuild `fullchain.pem`, replace `privkey.pem` when applicable, and rerun the deployment command.

### Deploy and update

Commit and push the deployment files to `main` before the first server clone. Then use the same command for the first deployment and every update:

```bash
cd /opt/hut/app
./deploy.sh
```

The script refuses a dirty tracked checkout, fast-forwards to `origin/main`, validates `.env` and TLS, rebuilds the image, waits for PostgreSQL, applies `drizzle-kit push --force`, checks application health, and recreates Nginx. Inspect the stack with:

```bash
docker compose ps
docker compose logs --tail=200 app nginx db
curl --resolve new.hut.ac.ir:443:127.0.0.1 https://new.hut.ac.ir/healthz
```

`docker compose down` preserves the database. `docker compose down --volumes` deliberately deletes it.

### Manual database backup and restore

Scheduled backups are outside the beta scope. A manual custom-format dump can be created with:

```bash
docker compose exec -T db sh -c 'pg_dump --format=custom --username="$POSTGRES_USER" "$POSTGRES_DB"' > /opt/hut/backups/hut.dump
```

Restore it into the running database with:

```bash
docker compose exec -T db sh -c 'pg_restore --clean --if-exists --username="$POSTGRES_USER" --dbname="$POSTGRES_DB"' < /opt/hut/backups/hut.dump
```

## Styling

This template comes with [Tailwind CSS](https://tailwindcss.com/) already configured for a simple default starting experience. You can use whatever CSS framework you prefer.

---

Built with ❤️ using React Router.

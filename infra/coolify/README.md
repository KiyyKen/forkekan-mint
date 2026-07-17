# Coolify Deployment

Placeholder konfigurasi deployment Coolify (Phase 11 — Deployment).

Lihat [docs/11-deployment.md](../../docs/11-deployment.md) untuk strategi deployment lengkap.

Rencana:

- Setiap service (web, api, worker) dideploy sebagai aplikasi Docker terpisah.
- PostgreSQL & Redis sebagai managed resource Coolify.
- Environment variables diisi melalui dashboard Coolify (jangan commit `.env`).
- Nginx reverse proxy + Let's Encrypt untuk HTTPS.

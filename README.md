# Videoplatform

Monorepo für persönliche Videoplattform.

Ordner:
- backend: Node.js/Express (TypeScript), PostgreSQL, tus-Uploads, ffprobe
- frontend: Vite/React/TypeScript (Darkmode, PWA), einfache Sidebar-Navigation
- docker: Compose-Stacks und Postgres-Init

Schnellstart (Entwicklung)
- .env aus .env.example erstellen und Werte setzen
- Docker-Stack: docker compose up --build
  - Backend: http://localhost:4000
  - Frontend: http://localhost:5173

Anmeldung
- Einzelner Benutzer, Zugangsdaten aus .env (SERVER_USERNAME, SERVER_PASSWORD)

Uploads
- tus-basierter Upload-Endpunkt unter /api/tus
- Finalisierung nach Server-Verifikation über /api/videos/finalize
- Dateien landen unter /uploads/{Titel}/

Datenbank
- Postgres mit init SQL in docker/postgres/init
- Tabellen: videos, categories, tags, video_tags, users

Deployment
- Für Portainer via docker/docker-compose.prod.yml
- Images vorgesehen: ghcr.io/webdesign-ladisch/videoplatform-backend, ghcr.io/webdesign-ladisch/videoplatform-frontend
- Nginx Proxy Manager kann die Services frontend/backend terminieren

To-Do (nächste Schritte)
- Kategorien/Tags CRUD-APIs und UI
- Favoriten-Ansicht serverseitig filtern
- tus Upload-Flow im Frontend finalisieren
- PWA Icons/Service Worker
- ShadCN/UI Theme verfeinern (Darkmode: Anthrazit/Jaguargrün)

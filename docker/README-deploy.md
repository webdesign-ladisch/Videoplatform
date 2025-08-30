Portainer Deployment (Webhook)

- Erstelle in Portainer einen Stack basierend auf docker/docker-compose.prod.yml.
- Lege die .env Variablen im Stack oder über Portainer-Umgebungsvariablen fest (DATABASE_URL, VITE_API_BASE, POSTGRES_*).
- Aktiviere den Portainer Webhook für den Stack und kopiere die Webhook-URL.

GitHub Trigger
- Lege in den Repository-Secrets die Variable PORTAINER_WEBHOOK_URL an.
- Füge folgenden Schritt an das Ende des Workflows hinzu oder erstelle einen separaten Workflow:

  - name: Trigger Portainer webhook
    if: ${{ github.event_name != 'pull_request' }}
    run: |
      curl -X POST "$PORTAINER_WEBHOOK_URL"

Nginx Proxy Manager
- Exponiere im Portainer/NPM die Services "frontend" und "backend".
- Setze die Ziel-Ports entsprechend der Container-Ports (Frontend 5173, Backend 4000) oder nutze einen separaten Webserver für das Frontend (empfohlen).
- Trage die öffentliche Basis-URL in .env (VITE_API_BASE) ein, damit das Frontend korrekt mit dem Backend spricht.

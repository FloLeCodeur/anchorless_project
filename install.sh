#!/bin/bash

set -e

echo "🚀 Installation du projet Anchorless..."

# Couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Répertoire courant
PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"

# Nettoyer et recréer les dossiers
echo -e "${BLUE}🧹 Préparation des dossiers...${NC}"
rm -rf "${PROJECT_DIR}/backend" "${PROJECT_DIR}/frontend"
mkdir -p "${PROJECT_DIR}/backend" "${PROJECT_DIR}/frontend"

# Installer Laravel
echo -e "${BLUE}📦 Installation de Laravel...${NC}"
docker run --rm -v "${PROJECT_DIR}/backend":/app -w /app composer create-project laravel/laravel . --no-interaction

# Configurer .env Laravel
echo -e "${BLUE}⚙️  Configuration de Laravel...${NC}"
cat > "${PROJECT_DIR}/backend/.env" << 'EOF'
APP_NAME=Anchorless
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:8000

LOG_CHANNEL=stack
LOG_LEVEL=debug

DB_CONNECTION=pgsql
DB_HOST=db
DB_PORT=5432
DB_DATABASE=anchorless
DB_USERNAME=anchorless
DB_PASSWORD=secret

CACHE_DRIVER=file
SESSION_DRIVER=file
QUEUE_CONNECTION=sync
EOF

# Installer Remix
echo -e "${BLUE}📦 Installation de Remix...${NC}"
docker run --rm -v "${PROJECT_DIR}/frontend":/app -w /app node:20-alpine sh -c "npx create-remix@latest . --template remix-run/remix/templates/remix --no-install"

# Configurer vite.config.ts pour Docker
echo -e "${BLUE}⚙️  Configuration de Remix pour Docker...${NC}"
cat > "${PROJECT_DIR}/frontend/vite.config.ts" << 'EOF'
import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [remix(), tsconfigPaths()],
  server: {
    host: "0.0.0.0",
    port: 3000,
    watch: {
      usePolling: true,
    },
  },
});
EOF

# Lancer Docker
echo -e "${BLUE}🐳 Lancement des containers Docker...${NC}"
cd "${PROJECT_DIR}"
docker compose up -d --build

# Attendre que la DB soit prête
echo -e "${BLUE}⏳ Attente de la base de données (15s)...${NC}"
sleep 15

# Finaliser Laravel
echo -e "${BLUE}🔑 Génération de la clé Laravel...${NC}"
docker exec anchorless_backend php artisan key:generate --force

echo -e "${BLUE}📊 Lancement des migrations...${NC}"
docker exec anchorless_backend php artisan migrate --force

# Permissions
docker exec anchorless_backend chown -R www-data:www-data storage bootstrap/cache

# Installer les dépendances Remix
echo -e "${BLUE}📦 Installation des dépendances Remix...${NC}"
docker exec anchorless_frontend npm install

echo ""
echo -e "${GREEN}✅ Installation terminée !${NC}"
echo ""
echo "🌐 Accès :"
echo "   Frontend Remix  : http://localhost:3000"
echo "   Backend Laravel : http://localhost:8000"
echo "   API             : http://localhost:8000/api"
echo ""

.PHONY: install start stop help

# Couleurs
GREEN=\033[0;32m
BLUE=\033[0;34m
NC=\033[0m

## —— 🚀 Installation ——————————————————————————————————————————
install: ## Installation Laravel (composer + storage link)
	@echo "$(BLUE)📦 Installation de Laravel...$(NC)"
	@docker exec anchorless_backend composer install
	@docker exec anchorless_backend php artisan storage:link || true
	@docker exec anchorless_backend php artisan migrate --force || true
	@echo "$(GREEN)✅ Installation terminée !$(NC)"

## —— 🐳 Docker ——————————————————————————————————————————————————
start: ## Démarrer les containers
	@echo "$(BLUE)🚀 Démarrage des containers...$(NC)"
	@docker compose up -d --wait
	@echo "$(GREEN)✅ Containers démarrés !$(NC)"
	@echo ""
	@echo "🌐 Accès :"
	@echo "   Frontend : http://localhost:3000"
	@echo "   Backend  : http://localhost:8000"

stop: ## Arrêter les containers
	@docker compose down

## —— ❓ Aide ——————————————————————————————————————————————————————
help: ## Afficher cette aide
	@grep -E '^[a-zA-Z_-]+:.*?##' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "$(GREEN)%-15s$(NC) %s\n", $$1, $$2}'
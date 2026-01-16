# Anchorless Project

Monorepo Laravel (API) + Remix (Frontend) avec Docker.

## 📁 Structure

```
anchorless_project/
├── backend/              # Laravel API
├── frontend/             # Remix App
├── docker/
│   ├── nginx/            # Config Nginx
│   │   └── default.conf
│   ├── php/              # Config PHP + Dockerfile
│   │   ├── Dockerfile
│   │   └── local.ini
│   └── node/             # Dockerfile Node
│       └── Dockerfile
├── docker-compose.yml
├── install.sh
├── .env
└── README.md
```

## 🚀 Installation

### Prérequis
- Docker & Docker Compose
- Git

#### 5. Lancer les containers
```bash
make start
```

#### 5. Installer laravel + Faire les liens vers le storage laravel
><ins>Ne faire cette commande qu'une seule fois à l'initialisation du projet </ins>🚨
```bash
make intall
```

## 🌐 Accès

| Service          | URL                        |
|------------------|----------------------------|
| Frontend Remix   | http://localhost:3000      |
| Backend Laravel  | http://localhost:8000      |
| API              | http://localhost:8000/api  |
| PostgreSQL       | localhost:5432             |


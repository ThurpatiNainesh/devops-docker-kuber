 # Docker Compose – Command Reference

Docker Compose is used to manage multiple application containers (Backend, Frontend, PostgreSQL, Redis, etc.) using a single `docker-compose.yml` file.

## 1. Start Containers

| Command | Description |
|---|---|
| `docker-compose up` | Start all containers |
| `docker-compose up --build` | Build images and start containers |
| `docker-compose up -d` | Start containers in background (detached mode) |
| `docker-compose up --build -d` | Build images and start containers in background |

## 2. Stop Containers

| Command | Description |
|---|---|
| `docker-compose down` | Stop and remove containers and networks |
| `docker-compose down -v` | Stop and remove containers, networks, and associated volumes |

**Warning:** `down -v` deletes associated Docker volumes, which may contain database data.

## 3. Check Containers

```bash
docker-compose ps
```

Lists containers, their status, and exposed ports.

## 4. View Logs

| Command | Description |
|---|---|
| `docker-compose logs` | View logs from all services |
| `docker-compose logs backend` | View backend logs |
| `docker-compose logs -f` | Follow logs from all services |
| `docker-compose logs -f backend` | Follow backend logs continuously |
| `docker-compose logs -f frontend` | Follow frontend logs continuously |

Press `CTRL + C` to stop following logs. Containers continue running.

## 5. Typical Development Workflow

```bash
# Build images and start containers
docker-compose up --build -d

# Check running containers
docker-compose ps

# Monitor backend logs
docker-compose logs -f backend

# Stop and remove containers
docker-compose down
```

## 6. Docker Compose V1 vs V2

Modern Docker Compose uses a space instead of a hyphen.

```bash
# Older syntax
docker-compose up -d

# Recommended syntax
docker compose up -d
```

Both provide the same general functionality. Prefer `docker compose` for new projects.

#!/bin/bash
# ============================================
# DOCKER COMMAND REFERENCE GUIDE
# ============================================

# ============================================
# DOCKER BASICS
# ============================================

# Check Docker version
docker --version

# Display system-wide information
docker info

# Get help for any command
docker <command> --help


# ============================================
# IMAGE COMMANDS
# ============================================

# List all images on your system
docker images
docker image ls

# Pull an image from Docker Hub
docker pull nginx
docker pull ubuntu:20.04  # Specific version

# Search for images on Docker Hub
docker search nginx

# Build an image from a Dockerfile in current directory
docker build -t myapp:1.0 .

# Build with a specific Dockerfile name
docker build -f Dockerfile.dev -t myapp:dev .

# Remove an image
docker rmi nginx
docker rmi image_id

# Remove all unused images
docker image prune -a

# Tag an image (useful before pushing)
docker tag myapp:1.0 username/myapp:1.0

# Push image to Docker Hub
docker push username/myapp:1.0

# View image history and layers
docker history nginx


# ============================================
# CONTAINER COMMANDS
# ============================================

# List running containers
docker ps

# List all containers (running and stopped)
docker ps -a

# Run a container from an image
docker run nginx

# Run container with name
docker run --name my-nginx nginx

# Run container in detached mode (background)
docker run -d nginx

# Run container with port mapping (host:container)
docker run -d -p 8080:80 nginx

# Run container with environment variables
docker run -d -e MYSQL_ROOT_PASSWORD=secret mysql

# Run container with volume mounting
docker run -d -v /host/path:/container/path nginx

# Run container and remove it after it stops
docker run --rm nginx

# Run container interactively with terminal
docker run -it ubuntu bash

# Execute command in running container
docker exec my-nginx ls /etc

# Execute interactive bash in running container
docker exec -it my-nginx bash

# Start a stopped container
docker start container_name
docker start container_id

# Stop a running container (graceful)
docker stop container_name

# Kill a running container (force)
docker kill container_name

# Restart a container
docker restart container_name

# Pause a container
docker pause container_name

# Unpause a container
docker unpause container_name

# Remove a container
docker rm container_name

# Remove a running container (force)
docker rm -f container_name

# Remove all stopped containers
docker container prune


# ============================================
# CONTAINER INSPECTION & LOGS
# ============================================

# View container logs
docker logs container_name

# Follow log output (like tail -f)
docker logs -f container_name

# Show last 100 lines of logs
docker logs --tail 100 container_name

# Inspect container details (JSON output)
docker inspect container_name

# View container resource usage statistics
docker stats

# View stats for specific container
docker stats container_name

# View running processes in container
docker top container_name

# Copy files from container to host
docker cp container_name:/path/in/container /host/path

# Copy files from host to container
docker cp /host/path container_name:/path/in/container


# ============================================
# DOCKER VOLUMES
# ============================================

# List volumes
docker volume ls

# Create a volume
docker volume create my-volume

# Inspect a volume
docker volume inspect my-volume

# Remove a volume
docker volume rm my-volume

# Remove all unused volumes
docker volume prune

# Run container with named volume
docker run -d -v my-volume:/app/data nginx


# ============================================
# DOCKER NETWORKS
# ============================================

# List networks
docker network ls

# Create a network
docker network create my-network

# Inspect a network
docker network inspect my-network

# Connect container to network
docker network connect my-network container_name

# Disconnect container from network
docker network disconnect my-network container_name

# Remove a network
docker network rm my-network

# Run container on specific network
docker run -d --network my-network nginx


# ============================================
# DOCKER COMPOSE (Multi-container apps)
# ============================================

# Start services defined in docker-compose.yml
docker-compose up

# Start in detached mode
docker-compose up -d

# Stop services
docker-compose down

# Stop and remove volumes
docker-compose down -v

# View logs of all services
docker-compose logs

# Follow logs
docker-compose logs -f

# List running services
docker-compose ps

# Build or rebuild services
docker-compose build

# Start specific service
docker-compose up service_name

# Execute command in running service
docker-compose exec service_name bash


# ============================================
# CLEANUP COMMANDS
# ============================================

# Remove all stopped containers
docker container prune

# Remove all unused images
docker image prune -a

# Remove all unused volumes
docker volume prune

# Remove all unused networks
docker network prune

# Remove everything (containers, images, volumes, networks)
docker system prune -a --volumes

# Show disk usage
docker system df


# ============================================
# DOCKERFILE EXAMPLE
# ============================================

# Create a Dockerfile with these contents:
cat > Dockerfile << 'EOF'
# Base image
FROM node:16-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application code
COPY . .

# Expose port
EXPOSE 3000

# Set environment variable
ENV NODE_ENV=production

# Define startup command
CMD ["npm", "start"]
EOF


# ============================================
# DOCKER-COMPOSE EXAMPLE
# ============================================

# Create a docker-compose.yml with these contents:
cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  web:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    volumes:
      - ./app:/app
    depends_on:
      - db
  
  db:
    image: postgres:13
    environment:
      - POSTGRES_PASSWORD=secret
    volumes:
      - db-data:/var/lib/postgresql/data

volumes:
  db-data:
EOF


# ============================================
# USEFUL COMBINATIONS
# ============================================

# Stop all running containers
docker stop $(docker ps -q)

# Remove all containers
docker rm $(docker ps -a -q)

# Remove all images
docker rmi $(docker images -q)

# View logs from last hour
docker logs --since 1h container_name

# Run container with auto-restart policy
docker run -d --restart unless-stopped nginx

# Limit container resources
docker run -d --memory="512m" --cpus="1.0" nginx

# Build and run in one command
docker build -t myapp . && docker run -d -p 8080:80 myapp
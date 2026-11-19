# Deploying the App on AWS EC2 (Amazon Linux 2023) with Docker Compose

This guide walks through deploying the application from
[`ThurpatiNainesh/docker`](https://github.com/ThurpatiNainesh/docker) onto an
AWS EC2 instance running **Amazon Linux 2023**, using **Docker** and
**Docker Compose**.

When you're done, the app will be reachable at:

| Service  | URL                          |
|----------|------------------------------|
| Frontend | `http://<EC2_PUBLIC_IP>:5173` |
| Backend  | `http://<EC2_PUBLIC_IP>:5000` |

> In the examples below, the instance IP is `13.233.98.147` and the key file is
> `keypair1.pem`. Replace both with your own values.

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Set Up the SSH Key](#2-set-up-the-ssh-key)
3. [Connect to the EC2 Instance](#3-connect-to-the-ec2-instance)
4. [Install Docker](#4-install-docker)
5. [Reconnect to Apply Group Changes](#5-reconnect-to-apply-group-changes)
6. [Install the Docker Compose Plugin](#6-install-the-docker-compose-plugin)
7. [Install Git and Clone the Repository](#7-install-git-and-clone-the-repository)
8. [Configure Environment Variables](#8-configure-environment-variables)
9. [Build and Run the Containers](#9-build-and-run-the-containers)
10. [Access the Application](#10-access-the-application)
11. [Updating the Deployment](#11-updating-the-deployment)
12. [Useful Commands](#12-useful-commands)
13. [Troubleshooting](#13-troubleshooting)

---

## 1. Prerequisites

Before you begin, make sure you have:

- An **EC2 instance** running **Amazon Linux 2023** (x86_64).
- The instance's **key pair file** (`.pem`) downloaded to your local machine.
- The instance's **public IP address**.
- A **Security Group** attached to the instance with these inbound rules:

| Type       | Port | Source                   | Purpose            |
|------------|------|--------------------------|--------------------|
| SSH        | 22   | Your IP (recommended)    | Remote login       |
| Custom TCP | 5173 | `0.0.0.0/0`              | Frontend (Vite)    |
| Custom TCP | 5000 | `0.0.0.0/0`              | Backend API        |

> Without the 5173 and 5000 rules, the containers will run fine but you won't be
> able to reach them from your browser.

---

## 2. Set Up the SSH Key

Run these commands on your **local machine** (macOS / Linux / WSL).

```bash
# Create the .ssh directory if it doesn't already exist
mkdir -p ~/.ssh

# Move the downloaded key into ~/.ssh
mv ~/Downloads/keypair1.pem ~/.ssh/

# Restrict permissions so only you can read the key
chmod 400 ~/.ssh/keypair1.pem
```

**Why `chmod 400`?** SSH refuses to use a private key that other users can read.
`400` makes the file read-only for the owner and inaccessible to everyone else.
Without it you'll get an `UNPROTECTED PRIVATE KEY FILE` error.

Optional — to view the key's contents:

```bash
cat ~/.ssh/keypair1.pem
```

> ⚠️ This is a **private key**. Never share it, paste it anywhere public, or
> commit it to Git.

---

## 3. Connect to the EC2 Instance

```bash
ssh -i ~/.ssh/keypair1.pem ec2-user@13.233.98.147
```

- `-i` tells SSH which private key to use.
- `ec2-user` is the default username on Amazon Linux.
- The first time you connect, type `yes` to trust the host fingerprint.

All remaining steps run **on the EC2 instance** unless stated otherwise.

---

## 4. Install Docker

Create an installation script:

```bash
nano install_docker_amazon.sh
```

Paste the following into the editor:

```bash
#!/bin/bash

echo "Updating system packages..."
sudo dnf update -y

echo "Installing Docker..."
sudo dnf install -y docker

echo "Adding ec2-user to docker group..."
sudo usermod -aG docker ec2-user

echo "Enabling and starting Docker service..."
sudo systemctl enable docker
sudo systemctl start docker

echo "Verifying Docker installation..."
docker --version || echo "Docker not found in current session (re-login may be required)."

echo ""
echo "Docker installation complete on Amazon Linux 2023!"
echo "IMPORTANT: Log out and log back in (or run 'newgrp docker')"
echo "so that 'ec2-user' can run docker without sudo."
echo ""
echo "After re-login, test with:"
echo "docker run hello-world"
```

Save and exit nano: press `Ctrl + O`, `Enter`, then `Ctrl + X`.

### What the script does

| Command | Purpose |
|---------|---------|
| `dnf update -y` | Updates all installed packages to their latest versions. |
| `dnf install -y docker` | Installs the Docker engine from the Amazon Linux repos. |
| `usermod -aG docker ec2-user` | Adds `ec2-user` to the `docker` group so you can run Docker **without `sudo`**. |
| `systemctl enable docker` | Starts Docker automatically whenever the instance reboots. |
| `systemctl start docker` | Starts the Docker service right now. |
| `docker --version` | Confirms Docker installed correctly. |

Make the script executable and run it:

```bash
chmod +x install_docker_amazon.sh
./install_docker_amazon.sh
```

---

## 5. Reconnect to Apply Group Changes

Group membership changes (from `usermod`) only take effect in a **new login
session**. Log out and back in:

```bash
exit
```

Then from your local machine:

```bash
ssh -i ~/.ssh/keypair1.pem ec2-user@13.233.98.147
```

Verify Docker works without `sudo`:

```bash
docker run hello-world
```

> Alternatively, instead of logging out you can run `newgrp docker` to start a
> shell with the new group applied.

---

## 6. Install the Docker Compose Plugin

Amazon Linux 2023's `docker` package doesn't include Docker Compose, so install
it manually as a Docker CLI plugin.

```bash
# Create the Docker CLI plugins directory
sudo mkdir -p /usr/local/lib/docker/cli-plugins

# Download the Docker Compose plugin binary (v2.29.2)
sudo curl -SL https://github.com/docker/compose/releases/download/v2.29.2/docker-compose-linux-x86_64 \
  -o /usr/local/lib/docker/cli-plugins/docker-compose

# Make it executable
sudo chmod +x /usr/local/lib/docker/cli-plugins/docker-compose

# Verify the installation
docker compose version
```

Expected output:

```
Docker Compose version v2.29.2
```

> Note the command is `docker compose` (a space, plugin style), **not** the old
> `docker-compose` (hyphen).
>
> If your instance is ARM-based (Graviton, e.g. `t4g`), download
> `docker-compose-linux-aarch64` instead.

---

## 7. Install Git and Clone the Repository

```bash
# Install Git
sudo dnf install -y git

# Clone the repository into a folder named "app"
git clone https://github.com/ThurpatiNainesh/docker.git app

# Move into the project directory
cd app
```

---

## 8. Configure Environment Variables

The backend reads its configuration from `server/.env`. This file is usually
not committed to Git (it holds secrets), so create it on the server:

```bash
nano server/.env
```

Add the variables your backend needs, for example:

```env
PORT=5000
# DATABASE_URL=...
# JWT_SECRET=...
```

Save and exit (`Ctrl + O`, `Enter`, `Ctrl + X`).

> Use the variable names your application actually expects — check the
> project's code or any `.env.example` file in the repo.

---

## 9. Build and Run the Containers

Make sure you're inside the `app` directory, then:

```bash
# Pull the latest code (useful if you've pushed changes since cloning)
git pull

# Build the Docker images defined in docker-compose.yml
docker compose build

# Start all services in the background (detached mode)
docker compose up -d
```

Check that everything is running:

```bash
# List running services and their status/ports
docker compose ps

# View logs from all services
docker compose logs
```

| Command | Purpose |
|---------|---------|
| `docker compose build` | Builds images from each service's Dockerfile. |
| `docker compose up -d` | Creates and starts containers; `-d` runs them in the background so they keep running after you disconnect. |
| `docker compose ps` | Shows each container's state and port mappings. |
| `docker compose logs` | Prints container output — the first place to look if something fails. |

---

## 10. Access the Application

Open these in your browser:

- **Frontend:** http://13.233.98.147:5173/
- **Backend:** http://13.233.98.147:5000/

If a page doesn't load, see [Troubleshooting](#13-troubleshooting).

---

## 11. Updating the Deployment

When you push new code to GitHub, redeploy with:

```bash
ssh -i ~/.ssh/keypair1.pem ec2-user@13.233.98.147
cd app
git pull
docker compose up -d --build
```

`--build` rebuilds any images whose source changed and restarts only the
affected containers.

---

## 12. Useful Commands

```bash
docker compose logs -f              # Follow logs live (Ctrl + C to stop)
docker compose logs -f <service>    # Follow logs for one service
docker compose restart              # Restart all services
docker compose down                 # Stop and remove containers
docker compose down -v              # Also remove volumes (deletes stored data!)
docker compose exec <service> sh    # Open a shell inside a running container
docker system prune -a              # Free disk space by removing unused images
```

---

## 13. Troubleshooting

**`permission denied while trying to connect to the Docker daemon socket`**
You haven't re-logged in since being added to the `docker` group. Run `exit`,
SSH back in, or run `newgrp docker`.

**`WARNING: UNPROTECTED PRIVATE KEY FILE!`**
Run `chmod 400 ~/.ssh/keypair1.pem` on your local machine.

**`docker: 'compose' is not a docker command`**
The Compose plugin isn't installed or isn't executable. Repeat
[Step 6](#6-install-the-docker-compose-plugin).

**Browser can't reach port 5173 or 5000**
- Check the EC2 Security Group allows inbound traffic on those ports.
- Run `docker compose ps` to confirm the containers are up and the ports are mapped.
- For the Vite frontend, the dev server must listen on all interfaces
  (`--host 0.0.0.0` or `server.host: true` in `vite.config`), otherwise it is
  only reachable from inside the container.

**Containers exit right after starting**
Run `docker compose logs` — this is usually a missing or wrong value in
`server/.env`.

**The public IP changed**
EC2 public IPs change when an instance is stopped and started. Attach an
**Elastic IP** to keep a fixed address.


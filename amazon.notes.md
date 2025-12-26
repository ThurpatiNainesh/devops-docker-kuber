mkdir -p ~/.ssh
mv ~/Downloads/keypair1n.pem ~/.ssh/
chmod 400 ~/.ssh/keypair1.pem
ssh -i ~/.ssh/keypair1.pem ec2-user@13.233.98.147
cat ~/.ssh/keypair1.pem (to view ssh key pair)
nano install_docker_amazon.sh


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
echo "docker run hello-world


nano install_docker_amazon.sh


chmod +x install_docker_amazon.sh


./install_docker_amazon.sh


exit


ssh -i ~/.ssh/keypair1.pem ec2-user@13.233.98.147

# Create Docker CLI plugins directory
sudo mkdir -p /usr/local/lib/docker/cli-plugins

# Download Docker Compose plugin
sudo curl -SL https://github.com/docker/compose/releases/download/v2.29.2/docker-compose-linux-x86_64 \
-o /usr/local/lib/docker/cli-plugins/docker-compose

# Give execute permission
sudo chmod +x /usr/local/lib/docker/cli-plugins/docker-compose

# Verify installation
docker compose version

sudo dnf install -y git

git clone https://github.com/ThurpatiNainesh/docker.git app

cd app 

nano server/.env

git pull

docker compose build

docker compose up -d

docker compose logs

docker compose ps 




http://13.233.98.147:5173/

http://13.233.98.147:5000/


EC2_HOST=13.233.98.147
EC2_USER=ec2-user
EC2_APP_DIR=/home/ec2-user/app
EC2_KEY=cat ~/.ssh/keypair1.pem




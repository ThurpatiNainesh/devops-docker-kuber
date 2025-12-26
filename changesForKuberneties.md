version: "3.8"

services:
  backend:
    build: ./server
    container_name: backend
    restart: always
    env_file:
      - ./server/.env
    ports:
      - "5000:5000"

  frontend:
    build:
      context: ./client
      args:
        VITE_API_URL: http://13.233.98.147:5000/api
    container_name: frontend
    restart: always
    ports:
      - "5173:5173"
    depends_on:
      - backend



## removed from the  dockerignore
.env
.env.*

# removed this line from the dockerfile
ARG VITE_APP_URL
ENV VITE_APP_URL=${VITE_APP_URL}


brew doctor

brew install kubectl

kubectl version --client

brew install minikube

minikube start

kubectl get nodes

minikube update-context

minikube stop

minikube start --driver=docker

minikube status

kubectl get nodes


docker build -t mern-backend:dev ./server
docker build -t mern-frontend:dev ./client

minikube image load mern-backend:dev
minikube image load mern-frontend:dev

kubectl create deployment backend --image=mern-backend:dev
kubectl set env deployment/backend MONGO_URI="mongodb+srv://sangammukherjee1996:sangammukherjee1996@cluster0.hajgu3b.mongodb.net"

kubectl get pods
kubectl logs deploy/backend

# Port-forward
kubectl port-forward deployment/backend 5000:5000

kubectl create deployment frontend --image=mern-frontend:dev

kubectl expose deployment frontend \
  --name=frontend-svc \
  --port=80 \
  --target-port=5173 \
  --type=NodePort

minikube service frontend-svc


minikube stop

## If you want to delete deployments cleanly
minikube start --driver=docker
kubectl delete deployment backend frontend
kubectl delete service frontend-svc
minikube stop

## If you want a full reset 
minikube delete



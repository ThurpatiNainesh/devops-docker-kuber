# Push a Docker Image to Docker Hub

Follow these steps from the folder that contains your `Dockerfile` and
application files.

## 1. Build the Docker image

``` bash
docker build -t calculatorjava .
```

This creates a local image named `calculatorjava`.

## 2. Log in to Docker Hub

``` bash
docker login
```

Enter your Docker Hub username and password (or access token) when
prompted.

## 3. Tag the image with your Docker Hub username

``` bash
docker tag calculatorjava ayush987456/calculatorapp:v1.0
```

Replace `ayush987456` with your Docker Hub username if it is different.

The format is:

``` bash
docker tag LOCAL_IMAGE USERNAME/REPOSITORY:TAG
```

## 4. Push the image to Docker Hub

``` bash
docker push ayush987456/calculatorapp:v1.0
```

Docker uploads the tagged image to the `calculatorapp` repository on
your Docker Hub account. Create that repository on Docker Hub first if
it does not already exist.

## 5. Verify the upload

Open Docker Hub and check your repository:

`https://hub.docker.com/r/ayush987456/calculatorapp`

## Quick command summary

``` bash
docker build -t calculatorjava .
docker login
docker tag calculatorjava ayush987456/calculatorapp:v1.0
docker push ayush987456/calculatorapp:v1.0
```

**Remember:** Build creates the image, tag gives it your Docker Hub
repository name, and push uploads it.

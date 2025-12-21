# Use Node.js version 20 with Alpine Linux (a lightweight Linux distribution)
# Alpine images are much smaller (~100MB vs ~900MB for regular node images)
# This reduces build time, storage, and deployment costs
FROM node:20-alpine

# Set the working directory inside the container to /app
# All subsequent commands will run from this directory
# This keeps your app organized and isolated from system files
WORKDIR /app

# Copy package.json and package-lock.json (if exists) to /app directory
# The asterisk (*) handles cases where package-lock.json might not exist
# We copy these FIRST (before copying other files) to leverage Docker's layer caching
# If package.json hasn't changed, Docker reuses the cached npm install layer
# This makes rebuilds much faster when you only change your code
COPY package*.json ./

# Install all dependencies listed in package.json
# This runs inside the container and creates node_modules folder
# Because we copied package.json first, this layer is cached unless dependencies change
RUN npm install

# Copy all remaining application files from your local machine to /app in container
# This includes all source files needed for the build process
# We do this AFTER npm install so code changes don't trigger dependency reinstalls
COPY . .

# Build the application for production
# This typically creates an optimized bundle in a dist/ or build/ folder
# The build step compiles and optimizes your code for better performance
RUN npm run build

# Document that the container listens on port 5173
# This is the default Vite preview server port
# This is informational only - it doesn't actually publish the port
# You still need to map ports when running: docker run -p 5173:5173
EXPOSE 5173

# Define the command to run when container starts
# This runs "npm run preview" which serves the production build
# CMD is the default command but can be overridden at runtime
CMD ["npm", "run", "preview"]
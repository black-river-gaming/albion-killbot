FROM node:16-alpine
WORKDIR /app

# Install project dependencies
COPY package*.json ./
RUN npm ci

# Copy all files except those listed in .dockerignore
COPY . .

# Build
RUN npm run build

# Install static server
RUN npm install -g serve

# Default environment and command to be overriden in each environment
CMD [ "serve", "build" ]

FROM node:lts AS build
WORKDIR /app

# Install node-prune (https://github.com/tj/node-prune)
RUN curl -sfL https://install.goreleaser.com/github.com/tj/node-prune.sh | bash -s -- -b /usr/local/bin

# Install project dependencies and prune unecessary files
COPY package*.json ./
RUN npm ci
RUN /usr/local/bin/node-prune

# Copy all files except those listed in .dockerignore
COPY . .

FROM node:lts-slim
WORKDIR /app

# Copy artifacts from build stage to reduce image size
COPY --from=build /app .

# Default environment and command to be overriden in each environment
CMD [ "npm", "start" ]

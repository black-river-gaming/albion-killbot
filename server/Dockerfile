FROM node:16-stretch AS build
WORKDIR /app

# RUN apk update && apk add yarn curl bash python g++ make && rm -rf /var/cache/apk/*
# Install node-prune (https://github.com/tj/node-prune)
RUN curl -sfL https://install.goreleaser.com/github.com/tj/node-prune.sh | bash -s -- -b /usr/local/bin

# Install project dependencies and prune unecessary files
COPY package*.json ./
RUN npm ci
RUN /usr/local/bin/node-prune

# Copy all files except those listed in .dockerignore
COPY . .

FROM node:14-stretch
WORKDIR /app

# Copy artifacts from build stage to reduce image size
COPY --from=build /app .

# Default environment and command to be overriden in each environment
CMD [ "npm", "start" ]

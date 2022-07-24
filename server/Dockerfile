FROM node:16 AS build
WORKDIR /app

# Set npm version
RUN npm i -g npm@8.5.5

# Install project dependencies and prune unecessary files
COPY package*.json ./
RUN npm ci --force
RUN npx node-prune

# Copy all files except those listed in .dockerignore
COPY . .

FROM node:16-slim
WORKDIR /app

# Copy artifacts from build stage to reduce image size
COPY --from=build /app .
COPY --from=build /etc/fonts /etc/fonts

# Default environment and command to be overriden in each environment
CMD [ "npm", "start" ]

FROM node:18 AS build
WORKDIR /app

# Install project dependencies and prune unecessary files
COPY package*.json ./
RUN npm ci
RUN npx node-prune

# Copy all files except those listed in .dockerignore
COPY . .

FROM node:18-slim
WORKDIR /app

# Copy artifacts from build stage to reduce image size
COPY --from=build /app .
COPY --from=build /etc/fonts /etc/fonts

# Default environment and command to be overriden in each environment
CMD [ "npm", "start" ]

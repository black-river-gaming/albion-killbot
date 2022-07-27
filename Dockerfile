FROM node:14-stretch AS build
WORKDIR /app


# Install project dependencies and prune unecessary files
COPY package*.json ./
RUN yarn install --production --frozen-lockfile && yarn cache clean
RUN npx node-prune

# Copy all files except those listed in .dockerignore
COPY . .

FROM node:14-stretch
WORKDIR /app

# Copy artifacts from build stage to reduce image size
COPY --from=build /app .

# Default environment and command to be overriden in each environment
CMD [ "yarn", "start" ]

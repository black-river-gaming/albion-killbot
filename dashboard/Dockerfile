FROM node:16-alpine as build
WORKDIR /app

# Install project dependencies
COPY package*.json ./
RUN npm ci --silent

# Copy all files except those listed in .dockerignore
COPY . .

# Build
RUN npm run build

FROM nginx:stable-alpine
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
CMD [ "nginx", "-g", "daemon off;"]

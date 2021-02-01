FROM node:13.3.0-stretch

WORKDIR /app

COPY package.json .
COPY yarn.lock .
RUN yarn install --production --frozen-lockfile && yarn cache clean

COPY . .

CMD ["yarn", "start"]

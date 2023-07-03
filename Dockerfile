FROM node:18.16.1-alpine

ENV PORT=3000
ENV NODE_ENV=development

WORKDIR /app

COPY package*.json ./

RUN npm install --omit=dev

COPY . .

RUN npm run build

EXPOSE $PORT

CMD ["npm", "start"]

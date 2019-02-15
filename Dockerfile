FROM node:7

# Создать директорию app
WORKDIR /app

# Установить зависимости приложения
COPY package*.json /app
RUN npm install

COPY . /app

CMD [ "node", "src/index.js" ]
EXPOSE 2010
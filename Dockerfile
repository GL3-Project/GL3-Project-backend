FROM node:18-alpine

WORKDIR /usr/src/app

COPY package*.json /usr/src/app/

RUN npm install

COPY . /usr/src/app

RUN npm run build

EXPOSE 80

CMD [ "node","dist/main.js" ]

FROM node:18

# Create app directory
WORKDIR /usr/src/app

RUN npm install -g typescript
RUN npm install -g ts-node
# Files required by pnpm install
COPY package*.json /usr/src/app/
COPY tsconfig.json /usr/src/app/

# Install app dependencies
RUN npm install

# Bundle app source
COPY ./src .

RUN npm run build

EXPOSE 8080

CMD [ "node","dist/main.js" ]

FROM node:16

# Create app directory
WORKDIR /usr/src/app

RUN yarn add global typescript
# Files required by pnpm install
COPY package*.json /usr/src/app/
COPY tsconfig.json /usr/src/app/

# Install app dependencies
RUN yarn

# Bundle app source
COPY ./src .

RUN yarn run build

EXPOSE 8080

CMD [ "node","dist/main.js" ]

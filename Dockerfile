FROM node:18-alpine3.16

# Create app directory
WORKDIR /usr/src/app

# Files required by pnpm install
#COPY package*.json /usr/src/app/
#COPY tsconfig.json /usr/src/app/

# Install app dependencies
RUN npm install

# Bundle app source
#COPY . /usr/src/app

# Build app
#RUN npm run build

# Expose port
EXPOSE 80

# Run app

CMD [ "node","dist/main.js" ]

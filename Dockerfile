FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Files required by pnpm install
COPY package*.json /usr/src/app/
COPY tsconfig*.json /usr/src/app/

# Install app dependencies
RUN npm install

# Bundle app source
COPY . /usr/src/app

# Build app
RUN npm run build

#This is required for the app to run on alpine
RUN apk add gcompat

# Expose port
EXPOSE 3000
# Run app

CMD [ "npm","start:prod" ]

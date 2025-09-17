# Official Node.js image as our base
FROM node:22-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json first to Docker cache
COPY package*.json ./

# Install app dependencies
RUN npm install

# Copy the rest of our app's source code into the container
COPY . .

# Expose the port the app will run on
# This is just for documentation purpose and will not expose ant port
# we need to manually do port binding while running docker run command
EXPOSE 8080

# The command that will get executed as soon as container is up
CMD ["npm", "run", "dev"]


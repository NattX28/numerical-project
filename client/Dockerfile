# Use Node.js as the base image
FROM node:18

# Set working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY client/package*.json ./
RUN npm install

# Copy the client code
COPY client/ .

# Build the React client app
RUN npm run build

# Serve the build
RUN npm install -g serve
EXPOSE 5000
CMD ["serve", "-s", "build"]

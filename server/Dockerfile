# Use Node.js as the base image
FROM node:18

# Create a directory for the app
WORKDIR /app

# Copy package.json and install dependencies
COPY server/package*.json ./
RUN npm install

# Copy the rest of the application code
COPY server/ .

# Expose the server port
EXPOSE 3000

# Run the server
CMD ["npm", "start"]

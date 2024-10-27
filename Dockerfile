# Build stage for Client
FROM node:18-alpine as client-builder
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
COPY client/ ./
# Set client environment variables if needed
ENV VITE_API_URL=/api
RUN npm run build

# Build stage for Server
FROM node:18-alpine as server-builder
WORKDIR /app/server
COPY server/package*.json ./
RUN npm install
COPY server/ ./

# Production stage
FROM node:18-alpine
WORKDIR /app

# Copy built client files to server's public directory
COPY --from=client-builder /app/client/dist ./server/public

# Copy server files and install production dependencies
COPY --from=server-builder /app/server ./server
WORKDIR /app/server
RUN npm install --production

# Environment variables
ENV PORT=3000
ENV NODE_ENV=production

# Expose only server port
EXPOSE 3000

# Start the server
CMD ["node", "index.js"]
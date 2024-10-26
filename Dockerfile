# Build stage for client
FROM node:18 as client-builder
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
COPY client/ ./
RUN npm run build

# Production stage
FROM node:18
WORKDIR /app

# Copy server files
COPY server/package*.json ./
RUN npm install
COPY server/ ./

# Copy built client files
COPY --from=client-builder /app/client/dist ./public

# Expose port
EXPOSE 3000

# Start command
CMD ["npm", "start"]
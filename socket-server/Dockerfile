# Use Node.js LTS (Long Term Support) version
FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code and env file
COPY index.js .
COPY .env .

# Expose the WebSocket port (matches your code's PORT || 8080)
EXPOSE 8080

# Use dumb-init to handle signals properly
RUN apk add --no-cache dumb-init

# Start the server with dumb-init
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "index.js"]
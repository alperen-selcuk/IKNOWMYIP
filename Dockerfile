FROM node:20-alpine

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

WORKDIR /app

# Create node_modules directory with proper permissions
RUN mkdir -p node_modules && chown -R node:node /app

# Switch to node user for security
USER node

# Copy package files with proper ownership
COPY --chown=node:node package*.json ./

# Clear npm cache and install dependencies
RUN npm cache clean --force && \
    npm install --no-optional --production=false

# Copy all files with proper ownership
COPY --chown=node:node . .

# Build frontend application (in production mode)
RUN npm run build

# Expose the port
EXPOSE 5000

# Use dumb-init for proper signal handling
ENTRYPOINT ["dumb-init", "--"]

# Run the application
CMD ["npm", "start"]
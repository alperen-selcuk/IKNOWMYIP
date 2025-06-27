FROM node:20-alpine

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

WORKDIR /app

# Copy package files first
COPY package*.json ./

# Clean install without package-lock to avoid conflicts
RUN rm -f package-lock.json && \
    npm cache clean --force && \
    npm install

# Copy all files
COPY . .

# Build frontend application
RUN npm run build

# Expose the port
EXPOSE 5000

# Use dumb-init for proper signal handling
ENTRYPOINT ["dumb-init", "--"]

# Run the application
CMD ["npm", "start"]
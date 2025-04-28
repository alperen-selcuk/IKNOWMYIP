FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all files
COPY . .

# Build frontend application (in production mode)
RUN npm run build

# Expose the port
EXPOSE 5000

# Run the application
CMD ["npm", "start"]
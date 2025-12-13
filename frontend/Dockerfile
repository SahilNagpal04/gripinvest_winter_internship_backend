# Frontend Dockerfile - builds and runs Next.js app

# Use Node.js base image
FROM node:18-alpine

# Set working directory inside container
WORKDIR /app

# Copy package files first (for better caching)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all frontend files
COPY . .

# Build the Next.js application
RUN npm run build

# Expose port 3000 for the app
EXPOSE 3000

# Start the application
CMD ["npm", "start"]

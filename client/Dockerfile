FROM node:18

WORKDIR /app

# Install necessary packages
RUN apt-get update && \
    apt-get install -y curl && \
    rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package*.json ./

# Install dependencies with clean npm cache
RUN npm cache clean --force && \
    npm install && \
    npm cache clean --force

# Copy application files
COPY . .

# Configure Node.js for production with increased memory
ENV NODE_ENV=production
ENV NODE_OPTIONS="--max-old-space-size=8192"

# Build the application with increased memory allocation
RUN npm run build

# Install http-server instead of serve
RUN npm install -g http-server

EXPOSE 3000

# Use http-server directly instead of PM2
CMD ["http-server", "build", "-p", "3000", "--proxy", "http://localhost:3000?"]

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

# Install PM2 globally for better process management
RUN npm install -g pm2 serve

EXPOSE 3000

# Use PM2 to manage the serve process
CMD ["pm2-runtime", "start", "serve", "--", "-s", "build", "-l", "3000", "--no-clipboard", "--single"]

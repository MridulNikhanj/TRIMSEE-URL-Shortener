FROM node:18

WORKDIR /app

# Install necessary packages
RUN apt-get update && \
    apt-get install -y curl && \
    rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application files
COPY . .

# Configure Node.js for production
ENV NODE_ENV=production
ENV NODE_OPTIONS="--max-old-space-size=4096"

# Build the application
RUN npm run build

# Install serve to run the built application
RUN npm install -g serve

EXPOSE 3000

# Use serve instead of development server
CMD ["serve", "-s", "build", "-l", "3000"]

FROM node:18

WORKDIR /app

# Install necessary packages
RUN apt-get update && \
    apt-get install -y curl jq net-tools && \
    rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package*.json ./

# Install dependencies with clean npm cache
RUN npm cache clean --force && \
    npm install && \
    npm cache clean --force

# Copy application files
COPY . .

# Create health check script with memory monitoring
RUN echo '#!/bin/bash\n\
log_with_timestamp() {\n\
    echo "$(date "+%Y-%m-%d %H:%M:%S") - $1"\n\
}\n\
\n\
# Check if Node process is running\n\
if ! pgrep -x "node" > /dev/null; then\n\
    log_with_timestamp "ERROR: Node.js process is not running"\n\
    exit 1\n\
fi\n\
\n\
# Check if port is listening\n\
if ! netstat -tuln | grep ":3200" > /dev/null; then\n\
    log_with_timestamp "ERROR: Port 3200 is not listening"\n\
    exit 1\n\
fi\n\
\n\
# Make health check request\n\
response=$(curl -s http://localhost:3200/health)\n\
log_with_timestamp "Health check response: $response"\n\
\n\
# Check if response is valid JSON\n\
if ! echo "$response" | jq . > /dev/null 2>&1; then\n\
    log_with_timestamp "ERROR: Invalid JSON response from health check endpoint"\n\
    exit 1\n\
fi\n\
\n\
# Extract and check status\n\
status=$(echo "$response" | jq -r .status)\n\
db_state=$(echo "$response" | jq -r .dbState)\n\
\n\
log_with_timestamp "Health Status: $status, DB State: $db_state"\n\
\n\
if [ "$status" != "healthy" ]; then\n\
    log_with_timestamp "ERROR: Unhealthy status detected"\n\
    exit 1\n\
fi\n\
\n\
exit 0' > /healthcheck.sh

RUN chmod +x /healthcheck.sh

# Set environment variables
RUN echo "DB_URI=${DB_URI:-mongodb+srv://nikhanjmridul:XcRsInwe9rfoVAtm@cluster0.o59qiro.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0}\nBASE=${BASE:-http://localhost:3200}\nNODE_ENV=production\nDEBUG=express:*,mongodb:*" > .env

# Configure Node.js for production with optimized memory settings
ENV NODE_ENV=production
ENV NODE_OPTIONS="--max-old-space-size=2048 --expose-gc --gc-interval=100"

EXPOSE 3200

HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 CMD /healthcheck.sh

# Run node directly with garbage collection flags
CMD ["node", "--expose-gc", "--gc-interval=100", "index.js"]

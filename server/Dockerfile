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
RUN echo '#!/bin/sh\nlog() {\n    echo "[$(date -u +"%Y-%m-%dT%H:%M:%SZ")] $1"\n}\n\n# Check memory usage\nMEM_USAGE=$(free -m | awk "/Mem:/ {print int((\$3/\$2)*100)}")\nlog "Memory usage: ${MEM_USAGE}%"\n\nNODE_PROCESS=$(ps aux | grep "node index.js" | grep -v grep)\nif [ -z "$NODE_PROCESS" ]; then\n    log "ERROR: Node.js process is not running"\n    log "Process list:"\n    ps aux\n    exit 1\nfi\n\nif ! netstat -tuln | grep ":3200" > /dev/null; then\n    log "ERROR: Port 3200 is not listening"\n    log "Network status:"\n    netstat -tuln\n    exit 1\nfi\n\nlog "Making health check request..."\nRESPONSE=$(curl -s -m 30 http://localhost:3200/health)\nSTATUS=$?\n\nif [ $STATUS -ne 0 ]; then\n    log "ERROR: Health check request failed with curl exit code: $STATUS"\n    log "Curl exit codes: 7=Failed to connect, 28=Timeout"\n    exit 1\nfi\n\nif ! echo "$RESPONSE" | jq -e . >/dev/null 2>&1; then\n    log "ERROR: Invalid JSON response:"\n    log "$RESPONSE"\n    exit 1\nfi\n\nSTATUS=$(echo "$RESPONSE" | jq -r .status)\nDB_STATE=$(echo "$RESPONSE" | jq -r .database)\n\nlog "Health check response - Status: $STATUS, Database: $DB_STATE"\n\nif [ "$STATUS" = "healthy" ] && [ "$DB_STATE" = "connected" ]; then\n    log "Health check passed successfully"\n    exit 0\nelse\n    log "ERROR: Unhealthy status detected"\n    log "Full response: $RESPONSE"\n    exit 1\nfi' > /healthcheck.sh && chmod +x /healthcheck.sh

# Set environment variables
RUN echo "DB_URI=${DB_URI:-mongodb+srv://nikhanjmridul:XcRsInwe9rfoVAtm@cluster0.o59qiro.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0}\nBASE=${BASE:-http://localhost:3200}\nNODE_ENV=production\nDEBUG=express:*,mongodb:*" > .env

# Configure Node.js for production with increased memory
ENV NODE_ENV=production
ENV NODE_OPTIONS="--max-old-space-size=8192 --max-semi-space-size=512 --optimize-for-size"

# Install PM2 globally for better process management
RUN npm install -g pm2

EXPOSE 3200

HEALTHCHECK --interval=45s --timeout=30s --start-period=60s --retries=5 CMD /healthcheck.sh

# Use PM2 to manage the Node.js process
CMD ["pm2-runtime", "start", "index.js", "--node-args='--optimize-for-size'"]

FROM node:18

WORKDIR /app

# Install curl and jq for health checks
RUN apt-get update && apt-get install -y curl jq net-tools && rm -rf /var/lib/apt/lists/*

# Create healthcheck script with detailed error reporting
RUN echo '#!/bin/sh\n\
log() {\n\
    echo "[$(date -u +"%Y-%m-%dT%H:%M:%SZ")] $1"\n\
}\n\
\n\
# Check if Node process is running\n\
NODE_PROCESS=$(ps aux | grep "node index.js" | grep -v grep)\n\
if [ -z "$NODE_PROCESS" ]; then\n\
    log "ERROR: Node.js process is not running"\n\
    log "Process list:"\n\
    ps aux\n\
    exit 1\n\
fi\n\
\n\
# Check if port is listening\n\
if ! netstat -tuln | grep ":3200" > /dev/null; then\n\
    log "ERROR: Port 3200 is not listening"\n\
    log "Network status:"\n\
    netstat -tuln\n\
    exit 1\n\
fi\n\
\n\
# Make health check request with timeout\n\
log "Making health check request..."\n\
RESPONSE=$(curl -s -m 5 http://localhost:3200/health)\n\
STATUS=$?\n\
\n\
if [ $STATUS -ne 0 ]; then\n\
    log "ERROR: Health check request failed with curl exit code: $STATUS"\n\
    log "Curl exit codes: 7=Failed to connect, 28=Timeout"\n\
    exit 1\n\
fi\n\
\n\
# Validate JSON response\n\
if ! echo "$RESPONSE" | jq -e . >/dev/null 2>&1; then\n\
    log "ERROR: Invalid JSON response:"\n\
    log "$RESPONSE"\n\
    exit 1\n\
fi\n\
\n\
# Check response status\n\
STATUS=$(echo "$RESPONSE" | jq -r .status)\n\
DB_STATE=$(echo "$RESPONSE" | jq -r .database)\n\
\n\
log "Health check response - Status: $STATUS, Database: $DB_STATE"\n\
\n\
if [ "$STATUS" = "healthy" ] && [ "$DB_STATE" = "connected" ]; then\n\
    log "Health check passed successfully"\n\
    exit 0\n\
else\n\
    log "ERROR: Unhealthy status detected"\n\
    log "Full response: $RESPONSE"\n\
    exit 1\n\
fi' > /healthcheck.sh && chmod +x /healthcheck.sh

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application files
COPY . .

# Create .env file with environment variables
RUN echo "DB_URI=${DB_URI:-mongodb+srv://nikhanjmridul:XcRsInwe9rfoVAtm@cluster0.o59qiro.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0}\n\
BASE=${BASE:-http://localhost:3200}\n\
NODE_ENV=${NODE_ENV:-development}\n\
DEBUG=express:*,mongodb:*" > .env

# Expose port
EXPOSE 3200

# Set environment variables
ENV NODE_OPTIONS="--trace-warnings"
ENV DEBUG="express:*,mongodb:*"

# Start the application
CMD ["node", "index.js"]

# Configure health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD /healthcheck.sh

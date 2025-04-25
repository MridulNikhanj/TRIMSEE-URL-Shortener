FROM node:18

WORKDIR /app

# Install curl and jq for health checks
RUN apt-get update && apt-get install -y curl jq && rm -rf /var/lib/apt/lists/*

# Create healthcheck script with detailed error reporting
RUN echo '#!/bin/sh\n\
echo "Starting health check..."\n\
\n\
# Function to log with timestamp\n\
log() {\n\
    echo "[$(date -u +"%Y-%m-%dT%H:%M:%SZ")] $1"\n\
}\n\
\n\
# Check if the server is running\n\
if ! ps aux | grep "node index.js" | grep -v grep > /dev/null; then\n\
    log "ERROR: Node.js process is not running"\n\
    exit 1\n\
fi\n\
\n\
# Check if port 3200 is listening\n\
if ! netstat -tuln | grep ":3200" > /dev/null; then\n\
    log "ERROR: Port 3200 is not listening"\n\
    exit 1\n\
fi\n\
\n\
# Make the health check request with full response\n\
log "Making health check request..."\n\
RESPONSE=$(curl -s http://localhost:3200/health)\n\
STATUS=$?\n\
\n\
if [ $STATUS -ne 0 ]; then\n\
    log "ERROR: Health check request failed with curl exit code: $STATUS"\n\
    exit 1\n\
fi\n\
\n\
# Parse and check the response\n\
echo "$RESPONSE" | jq -e . > /dev/null 2>&1\n\
if [ $? -ne 0 ]; then\n\
    log "ERROR: Invalid JSON response from health check:"\n\
    log "$RESPONSE"\n\
    exit 1\n\
fi\n\
\n\
# Extract and log status\n\
STATUS=$(echo "$RESPONSE" | jq -r .status)\n\
DB_STATE=$(echo "$RESPONSE" | jq -r .database)\n\
\n\
log "Health check response - Status: $STATUS, Database: $DB_STATE"\n\
\n\
if [ "$STATUS" = "healthy" ]; then\n\
    log "Health check passed successfully"\n\
    exit 0\n\
else\n\
    log "ERROR: Unhealthy status detected"\n\
    log "Full response: $RESPONSE"\n\
    exit 1\n\
fi' > /healthcheck.sh && \
    chmod +x /healthcheck.sh

COPY package*.json ./

RUN npm install

COPY . .

# Create a .env file with hardcoded values
RUN echo "DB_URI=mongodb+srv://nikhanjmridul:XcRsInwe9rfoVAtm@cluster0.o59qiro.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0\n\
BASE=http://localhost:3200\n\
NODE_ENV=development" > .env

EXPOSE 3200

# Start with increased debugging
ENV DEBUG=express:*,mongodb:*
ENV NODE_OPTIONS="--trace-warnings"
ENV NODE_ENV=development

# Add netstat for port checking
RUN apt-get update && apt-get install -y net-tools && rm -rf /var/lib/apt/lists/*

# Use node directly in production with explicit environment variables
CMD ["node", "index.js"]

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD /healthcheck.sh

FROM node:18

WORKDIR /app

RUN apt-get update && \
    apt-get install -y curl jq net-tools && \
    rm -rf /var/lib/apt/lists/*

COPY package*.json ./

RUN npm cache clean --force && \
    npm install && \
    npm cache clean --force

COPY . .

RUN echo '#!/bin/bash\n\
log_with_timestamp() {\n\
    echo "$(date "+%Y-%m-%d %H:%M:%S") - $1"\n\
}\n\
\n\
if ! pgrep -x "node" > /dev/null; then\n\
    log_with_timestamp "ERROR: Node.js process is not running"\n\
    exit 1\n\
fi\n\
\n\
if ! netstat -tuln | grep ":3200" > /dev/null; then\n\
    log_with_timestamp "ERROR: Port 3200 is not listening"\n\
    exit 1\n\
fi\n\
\n\
response=$(curl -s http://localhost:3200/health)\n\
log_with_timestamp "Health check response: $response"\n\
\n\
if ! echo "$response" | jq . > /dev/null 2>&1; then\n\
    log_with_timestamp "ERROR: Invalid JSON response from health check endpoint"\n\
    exit 1\n\
fi\n\
\n\
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

RUN echo "DB_URI=${DB_URI:-mongodb+srv://nikhanjmridul:XcRsInwe9rfoVAtm@cluster0.o59qiro.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0}\nBASE=${BASE:-http://localhost:3200}\nNODE_ENV=production\nDEBUG=express:*,mongodb:*" > .env

ENV NODE_ENV=production
ENV NODE_OPTIONS="--max-old-space-size=2048 --expose-gc --gc-interval=100"

EXPOSE 3200

HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 CMD /healthcheck.sh

CMD ["node", "--expose-gc", "--gc-interval=100", "index.js"]

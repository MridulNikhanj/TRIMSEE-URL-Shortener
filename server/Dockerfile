FROM node:18

WORKDIR /app

# Install curl for health checks
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Create healthcheck script
RUN echo '#!/bin/sh\ncurl -f http://localhost:3200/health || exit 1' > /healthcheck.sh && \
    chmod +x /healthcheck.sh

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3200

# Use node directly in production
CMD ["node", "index.js"]

HEALTHCHECK --interval=10s --timeout=5s --start-period=30s --retries=3 \
    CMD /healthcheck.sh

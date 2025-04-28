FROM node:18

WORKDIR /app

RUN apt-get update && \
    apt-get install -y curl && \
    rm -rf /var/lib/apt/lists/*

COPY package*.json ./

RUN npm cache clean --force && \
    npm install && \
    npm cache clean --force

COPY . .

ENV NODE_ENV=production
ENV NODE_OPTIONS="--max-old-space-size=8192"

RUN npm run build

RUN npm install -g http-server

EXPOSE 3000

CMD ["http-server", "build", "-p", "3000", "--proxy", "http://localhost:3000?"]

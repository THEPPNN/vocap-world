FROM node:20-alpine
WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY . .

# wait-for-db: retry connecting until PostgreSQL is ready, then migrate + start
CMD ["sh", "-c", "\
  echo 'Waiting for database...' && \
  until node -e \"require('pg').Pool && new (require('pg').Pool)({connectionString: process.env.DATABASE_URL}).query('SELECT 1').then(()=>process.exit(0)).catch(()=>process.exit(1))\" 2>/dev/null; do \
    echo 'DB not ready, retrying in 3s...' && sleep 3; \
  done && \
  echo 'DB ready! Running migrations...' && \
  node migrations/migrate.js && \
  node src/index.js \
"]
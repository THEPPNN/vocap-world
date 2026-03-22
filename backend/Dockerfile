FROM node:20-alpine
WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

# Run migrations then start server
CMD ["sh", "-c", "node migrations/migrate.js && node src/index.js"]

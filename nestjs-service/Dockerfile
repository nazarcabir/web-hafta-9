FROM node:18

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

# Using --legacy-peer-deps to avoid dependency conflict issues
RUN npm install --legacy-peer-deps

COPY . .

RUN npx prisma generate

EXPOSE 3000

CMD ["sh", "-c", "npx prisma migrate deploy && npm run start:dev"]

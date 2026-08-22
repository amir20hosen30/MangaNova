FROM node:20-bookworm-slim
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev
COPY . .
ENV NODE_ENV=production
ENV PORT=3000
ENV STORAGE_DIR=/app/storage
EXPOSE 3000
CMD ["npm","start"]

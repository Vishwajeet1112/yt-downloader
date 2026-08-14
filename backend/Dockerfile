FROM node:22-bookworm

# Install FFmpeg + Python
RUN apt-get update && \
    apt-get install -y \
    ffmpeg \
    python3 \
    python3-pip \
    ca-certificates \
    && pip3 install --break-system-packages yt-dlp \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

RUN mkdir -p /app/downloads

EXPOSE 3001

CMD ["npm", "start"]
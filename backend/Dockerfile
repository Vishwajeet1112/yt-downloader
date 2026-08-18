FROM node:22-bookworm

# System dependencies
RUN apt-get update && \
    apt-get install -y \
    ffmpeg \
    python3 \
    python3-pip \
    curl \
    ca-certificates \
    unzip \
    git \
    build-essential \
    libcairo2-dev \
    libjpeg-dev \
    libpango1.0-dev \
    libgif-dev \
    librsvg2-dev \
    && rm -rf /var/lib/apt/lists/*

# Deno for yt-dlp EJS JavaScript challenge solving
RUN curl -fsSL https://deno.land/install.sh | sh
ENV DENO_INSTALL=/root/.deno
ENV PATH="/root/.deno/bin:${PATH}"

# yt-dlp
RUN python3 -m pip install \
    --break-system-packages \
    --no-cache-dir \
    --upgrade \
    "yt-dlp[default]" \
    "bgutil-ytdlp-pot-provider==1.3.1"

# bgutil HTTP provider
RUN git clone --depth 1 --branch 1.3.1 https://github.com/Brainicism/bgutil-ytdlp-pot-provider.git /opt/bgutil-ytdlp-pot-provider \
    && cd /opt/bgutil-ytdlp-pot-provider/server \
    && npm ci \
    && npx tsc

COPY yt-dlp.conf /etc/yt-dlp.conf

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build
RUN mkdir -p /app/downloads

# Run the PO-token HTTP server and the API in the same container.
EXPOSE 3001
EXPOSE 4416

CMD ["sh", "-c", "cd /opt/bgutil-ytdlp-pot-provider/server && node build/main.js --port 4416 & exec npm start"]

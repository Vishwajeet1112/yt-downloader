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

# Deno for yt-dlp EJS JavaScript solving
RUN curl -fsSL https://deno.land/install.sh | sh
ENV DENO_INSTALL=/root/.deno
ENV PATH="/root/.deno/bin:${PATH}"

# yt-dlp + official/community PO-token provider plugin
RUN python3 -m pip install --break-system-packages --no-cache-dir --upgrade "yt-dlp[default]" "bgutil-ytdlp-pot-provider==1.3.1"

# Build the bgutil script provider locally.
# Script mode avoids requiring a second Railway service.
RUN git clone --depth 1 --branch 1.3.1 https://github.com/Brainicism/bgutil-ytdlp-pot-provider.git /opt/bgutil-ytdlp-pot-provider \
    && cd /opt/bgutil-ytdlp-pot-provider/server \
    && npm ci \
    && npx tsc

# Global yt-dlp configuration used by every yt-dlp invocation.
COPY yt-dlp.conf /etc/yt-dlp.conf

# Verify runtime
RUN node --version \
    && python3 --version \
    && ffmpeg -version \
    && deno --version \
    && yt-dlp --version \
    && test -f /opt/bgutil-ytdlp-pot-provider/server/build/generate_once.js

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

RUN mkdir -p /app/downloads

EXPOSE 3001

CMD ["npm", "start"]

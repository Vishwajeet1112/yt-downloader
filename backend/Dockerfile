FROM node:22-bookworm

# Install FFmpeg, Python, curl and certificates
RUN apt-get update && \
    apt-get install -y \
    ffmpeg \
    python3 \
    python3-pip \
    curl \
    ca-certificates \
    unzip \
    && rm -rf /var/lib/apt/lists/*

# Install Deno
RUN curl -fsSL https://deno.land/install.sh | sh

ENV DENO_INSTALL=/root/.deno
ENV PATH="${DENO_INSTALL}/bin:${PATH}"

# Install latest yt-dlp with default dependencies including EJS
RUN pip3 install --break-system-packages --upgrade "yt-dlp[default]"

# Verify installations
RUN deno --version && \
    yt-dlp --version && \
    ffmpeg -version

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

RUN mkdir -p /app/downloads

EXPOSE 3001

CMD ["npm", "start"]
FROM node:22-bookworm

# ==========================================
# SYSTEM DEPENDENCIES
# ==========================================

RUN apt-get update && \
    apt-get install -y \
    ffmpeg \
    python3 \
    python3-pip \
    curl \
    ca-certificates \
    unzip \
    && rm -rf /var/lib/apt/lists/*


# ==========================================
# INSTALL DENO
# ==========================================

RUN curl -fsSL https://deno.land/install.sh | sh

ENV DENO_INSTALL=/root/.deno
ENV PATH="/root/.deno/bin:${PATH}"


# ==========================================
# INSTALL LATEST YT-DLP
# ==========================================

RUN pip3 install \
    --break-system-packages \
    --no-cache-dir \
    --upgrade \
    "yt-dlp[default]"


# ==========================================
# VERIFY TOOLS
# ==========================================

RUN node --version
RUN python3 --version
RUN ffmpeg -version
RUN deno --version
RUN yt-dlp --version


# ==========================================
# APPLICATION
# ==========================================

WORKDIR /app


# ==========================================
# INSTALL NODE DEPENDENCIES
# ==========================================

COPY package*.json ./

RUN npm ci


# ==========================================
# COPY SOURCE
# ==========================================

COPY . .


# ==========================================
# BUILD TYPESCRIPT
# ==========================================

RUN npm run build


# ==========================================
# DOWNLOAD DIRECTORY
# ==========================================

RUN mkdir -p /app/downloads


# ==========================================
# PORT
# ==========================================

EXPOSE 3001


# ==========================================
# START
# ==========================================

CMD ["npm", "start"]
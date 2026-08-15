<p align="center">
  <img 
    src="./image.png" 
    alt="YT Downloader Project Structure"
    width="100%"
  />
</p>
# 🎬 YT Downloader

A modern full-stack YouTube/media downloader built with **React, TypeScript, Node.js, Express, yt-dlp, and Docker**.

The project provides a web-based interface for analyzing video URLs, selecting download quality, managing download jobs, downloading playlists, tracking real-time progress, filtering duplicate videos, and managing completed downloads.

---

## 🚀 Features

### 🎥 Video Download

- Analyze YouTube/media URLs
- Select download quality
- Best quality
- 4K
- 1080p
- 720p
- 480p
- 360p
- Audio
- Download job management
- Download progress tracking
- Download speed and ETA
- Error handling
- Cancel downloads
- Retry failed downloads
- Remove download jobs

### 📋 Playlist Support

- YouTube playlist support
- Playlist analysis
- Playlist download
- Playlist progress
- Current video tracking
- Completed video tracking
- Skipped video tracking
- Duplicate video filtering
- Individual playlist file management

Example:

```text
Original videos: 493
Unique videos: 493
Duplicates skipped: 0

Playlist: 1/493
Playlist: 2/493
Playlist: 3/493
```

### 📁 File Management

The application supports completed-file management and browser-based folder selection where supported.

The user can select a folder before saving the downloaded file.

> Browser folder selection depends on browser support for the File System Access API. Chrome/Edge desktop are recommended.

### 📊 Download Queue

Supported job states:

```text
queued
analyzing
downloading
processing
completed
failed
cancelled
```

### ⚡ Real-Time Progress

The backend provides download progress through **Server-Sent Events (SSE)**.

The frontend can receive:

- Download percentage
- Speed
- ETA
- Current job status
- Playlist progress
- Job updates
- Job additions
- Job removals

### 🐳 Docker Support

The project contains separate Docker containers for:

```text
Frontend
Backend
```

Docker Compose is used to run the complete application.

---

# 🏗️ Project Architecture

```text
                         ┌──────────────────────┐
                         │       Browser        │
                         │   React Frontend     │
                         │      Port 8080       │
                         └──────────┬───────────┘
                                    │
                                    │ HTTP / REST / SSE
                                    ▼
                         ┌──────────────────────┐
                         │       Backend        │
                         │ Node.js + Express    │
                         │      Port 3001       │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │        yt-dlp        │
                         │  Download Engine     │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │   Download Storage   │
                         │      downloads/      │
                         └──────────────────────┘
```

---

# 🛠️ Technology Stack

## Frontend

- React
- TypeScript
- Vite
- React Router
- Axios
- React Hook Form
- Zod
- Tailwind CSS
- Lucide React

## Backend

- Node.js
- TypeScript
- Express.js
- yt-dlp
- REST API
- Server-Sent Events
- Child Process

## DevOps

- Docker
- Docker Compose
- Nginx
- Git
- GitHub

---

# 📂 Project Structure

```text
yt-downloader/
│
├── backend/
│   │
│   ├── src/
│   │   ├── controllers/
│   │   │   └── downloadController.ts
│   │   │
│   │   ├── services/
│   │   │   ├── jobManager.ts
│   │   │   └── ytDlpService.ts
│   │   │
│   │   ├── routes/
│   │   │   └── downloadRoutes.ts
│   │   │
│   │   ├── types/
│   │   │   └── index.ts
│   │   │
│   │   └── utils/
│   │       └── validation.ts
│   │
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   │
│   ├── src/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── services/
│   │   └── types/
│   │
│   ├── Dockerfile
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
│
├── docs/
│   ├── project-structure.png
│   └── docker-images.png
│
├── downloads/
│
├── docker-compose.yml
├── .gitignore
└── README.md
```

---

# 📸 Project Structure

<p align="center">
  <img
    src="./docs/project-structure.png"
    alt="YT Downloader Project Structure"
    width="100%"
  />
</p>

---

# 🐳 Docker Installation

## Requirements

Install the following software:

- Git
- Docker Desktop
- Docker Engine
- Docker Compose

Check Git:

```bash
git --version
```

Check Docker:

```bash
docker --version
```

Check Docker Compose:

```bash
docker compose version
```

---

# 📥 Clone the Repository

Clone the project:

```bash
git clone https://github.com/Vishwajeet1112/yt-downloader.git
```

Enter the project:

```bash
cd yt-downloader
```

Check files:

```bash
dir
```

Linux/macOS:

```bash
ls
```

---

# 🐳 Run with Docker Compose

Build the complete project:

```bash
docker compose build
```

Start the application:

```bash
docker compose up -d
```

Or build and start in one command:

```bash
docker compose up -d --build
```

Check containers:

```bash
docker ps
```

Expected containers:

```text
yt-downloader-frontend
yt-downloader-backend
```

---

# 🌐 Application URLs

After Docker starts successfully:

### Frontend

```text
http://localhost:8080
```

### Backend

```text
http://localhost:3001
```

Open the frontend in your browser:

```text
http://localhost:8080
```

---

# 🐳 Docker Images

The project uses two Docker images:

| Image | Purpose | Port |
|---|---|---:|
| `yt-downloader-frontend:latest` | React frontend + Nginx | 8080 |
| `yt-downloader-backend:latest` | Node.js + Express + yt-dlp | 3001 |

Check images:

```bash
docker images
```

Example:

```text
REPOSITORY                 TAG       SIZE
yt-downloader-frontend     latest    ~93 MB
yt-downloader-backend      latest    ~2.5 GB
```

---

# 📸 Docker Images

<p align="center">
  <img
    src="./docs/docker-images.png"
    alt="YT Downloader Docker Images"
    width="100%"
  />
</p>

---

# 🔨 Build Docker Images Individually

Frontend:

```bash
docker build -t yt-downloader-frontend:latest ./frontend
```

Backend:

```bash
docker build -t yt-downloader-backend:latest ./backend
```

Check:

```bash
docker images
```

---

# ▶️ Run Docker Containers Manually

## Backend

```bash
docker run -d \
  --name yt-downloader-backend \
  -p 3001:3001 \
  -v ./downloads:/app/downloads \
  yt-downloader-backend:latest
```

## Frontend

```bash
docker run -d \
  --name yt-downloader-frontend \
  -p 8080:80 \
  yt-downloader-frontend:latest
```

> Docker Compose is recommended instead of manually starting both containers.

---

# 🔄 Docker Compose Commands

## Start

```bash
docker compose up -d
```

## Build and Start

```bash
docker compose up -d --build
```

## Stop

```bash
docker compose down
```

## Restart

```bash
docker compose restart
```

## Restart Backend

```bash
docker compose restart backend
```

## Restart Frontend

```bash
docker compose restart frontend
```

## Rebuild Everything

```bash
docker compose down
docker compose build --no-cache
docker compose up -d
```

## Rebuild After Code Changes

```bash
docker compose down
docker compose up -d --build
```

---

# 📋 Docker Container Commands

List running containers:

```bash
docker ps
```

List all containers:

```bash
docker ps -a
```

Inspect backend:

```bash
docker inspect yt-downloader-backend
```

Inspect frontend:

```bash
docker inspect yt-downloader-frontend
```

Stop backend:

```bash
docker stop yt-downloader-backend
```

Stop frontend:

```bash
docker stop yt-downloader-frontend
```

Start backend:

```bash
docker start yt-downloader-backend
```

Start frontend:

```bash
docker start yt-downloader-frontend
```

Restart backend:

```bash
docker restart yt-downloader-backend
```

Restart frontend:

```bash
docker restart yt-downloader-frontend
```

Remove backend:

```bash
docker rm yt-downloader-backend
```

Remove frontend:

```bash
docker rm yt-downloader-frontend
```

---

# 📜 Docker Logs

Backend logs:

```bash
docker logs yt-downloader-backend
```

Follow backend logs:

```bash
docker logs -f yt-downloader-backend
```

Frontend logs:

```bash
docker logs yt-downloader-frontend
```

Follow frontend logs:

```bash
docker logs -f yt-downloader-frontend
```

Docker Compose logs:

```bash
docker compose logs
```

Follow all logs:

```bash
docker compose logs -f
```

Backend only:

```bash
docker compose logs -f backend
```

Frontend only:

```bash
docker compose logs -f frontend
```

---

# 🗂️ Download Storage

The Docker Compose configuration uses a local download directory.

```yaml
volumes:
  - ./downloads:/app/downloads
```

This creates a connection between the project directory and the Docker container.

```text
Windows / Host
      │
      ▼
./downloads/
      │
      │ Docker Volume
      ▼
Container
/app/downloads/
```

The `downloads/` directory should normally be excluded from Git.

---

# 🔌 REST API

## Analyze URL

```http
POST /api/analyze
```

Example request:

```json
{
  "url": "https://www.youtube.com/watch?v=VIDEO_ID"
}
```

---

## Start Download

```http
POST /api/download
```

Example:

```json
{
  "url": "https://www.youtube.com/watch?v=VIDEO_ID",
  "options": {
    "quality": "best"
  }
}
```

---

## Get All Jobs

```http
GET /api/downloads
```

---

## Get Single Job

```http
GET /api/download/:id
```

---

## Cancel Job

```http
POST /api/download/:id/cancel
```

---

## Retry Job

```http
POST /api/download/:id/retry
```

---

## Remove Job

```http
DELETE /api/download/:id
```

---

## Download Completed File

```http
GET /api/download/:id/file
```

---

## Download Playlist File

```http
GET /api/download/:id/file/:filename
```

---

## Progress SSE

```http
GET /api/progress
```

The progress endpoint uses Server-Sent Events.

---

# 📥 Download Quality

Supported quality values:

```text
best
4k
1080
720
480
360
audio
```

Example:

```json
{
  "quality": "1080"
}
```

---

# 📋 Playlist Processing

Playlist processing follows this flow:

```text
Playlist URL
     │
     ▼
Analyze Playlist
     │
     ▼
Extract Videos
     │
     ▼
Check Duplicate Videos
     │
     ▼
Filter Unique Videos
     │
     ▼
Download Videos
     │
     ▼
Update Progress
     │
     ▼
Save Files
```

Example:

```text
================================
PLAYLIST FILTER
Original videos: 493
Unique videos: 493
Duplicates skipped: 0
================================

Starting playlist download: 493 unique videos

Playlist: 1/493
Playlist: 2/493
Playlist: 3/493
```

---

# 📊 Download Job States

```text
queued
   │
   ▼
analyzing
   │
   ▼
downloading
   │
   ▼
processing
   │
   ▼
completed
```

Failure:

```text
downloading
     │
     ▼
   failed
     │
     ▼
   retry
```

Cancellation:

```text
downloading
     │
     ▼
 cancelled
```

---

# 💻 Local Development

## Frontend

Enter frontend:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start development server:

```bash
npm run dev
```

Build frontend:

```bash
npm run build
```

Preview production build:

```bash
npm run preview
```

---

# ⚙️ Backend

Enter backend:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Build backend:

```bash
npm run build
```

Start production server:

```bash
npm start
```

If the project provides a development script:

```bash
npm run dev
```

---

# 🔧 Git Commands

## Check Git Version

```bash
git --version
```

---

## Initialize Repository

```bash
git init
```

If the repository already contains `.git`, you do not need to run `git init` again.

---

## Check Repository Status

```bash
git status
```

---

## Add All Files

```bash
git add .
```

Add a specific file:

```bash
git add README.md
```

Add a specific directory:

```bash
git add docs/
```

---

## Commit

```bash
git commit -m "Initial commit"
```

Example:

```bash
git commit -m "Add complete YouTube downloader project"
```

---

## Set Main Branch

```bash
git branch -M main
```

---

## Add GitHub Remote

```bash
git remote add origin https://github.com/Vishwajeet1112/yt-downloader.git
```

Check remote:

```bash
git remote -v
```

---

## Change Remote URL

If `origin already exists`:

```bash
git remote set-url origin https://github.com/Vishwajeet1112/yt-downloader.git
```

---

## Push to GitHub

First push:

```bash
git push -u origin main
```

Future pushes:

```bash
git push
```

---

# 🔄 Complete GitHub Upload Workflow

For a new local project:

```bash
cd E:\yt-downloader
```

Initialize:

```bash
git init
```

Add files:

```bash
git add .
```

Check:

```bash
git status
```

Commit:

```bash
git commit -m "Initial commit"
```

Set main:

```bash
git branch -M main
```

Add GitHub repository:

```bash
git remote add origin https://github.com/Vishwajeet1112/yt-downloader.git
```

Push:

```bash
git push -u origin main
```

---

# 🔄 Update Existing GitHub Project

After changing code:

```bash
git status
```

Add changes:

```bash
git add .
```

Commit:

```bash
git commit -m "Update project"
```

Push:

```bash
git push
```

---

# 📝 Git User Configuration

If Git shows:

```text
Please tell me who you are.
```

Configure your Git identity:

```bash
git config --global user.name "Vishwajeet1112"
```

Configure your GitHub email:

```bash
git config --global user.email "YOUR_GITHUB_EMAIL"
```

Check configuration:

```bash
git config --global user.name
git config --global user.email
```

---

# 🔍 Git History

View commits:

```bash
git log
```

Compact history:

```bash
git log --oneline
```

---

# 🌿 Git Branches

List branches:

```bash
git branch
```

Create branch:

```bash
git branch feature-name
```

Switch branch:

```bash
git checkout feature-name
```

Modern Git:

```bash
git switch feature-name
```

Create and switch:

```bash
git switch -c feature-name
```

---

# 📥 Clone and Update Project

Clone:

```bash
git clone https://github.com/Vishwajeet1112/yt-downloader.git
```

Enter:

```bash
cd yt-downloader
```

Get latest changes:

```bash
git pull
```

---

# 🔐 .gitignore

The following files should not be committed:

```text
node_modules/
dist/
downloads/
.env
.env.*
*.mp4
*.mp3
*.webm
*.mkv
*.part
*.log
```

Recommended `.gitignore`:

```gitignore
node_modules/
*/node_modules/

dist/
*/dist/

downloads/

.env
.env.*
!.env.example

*.mp4
*.mp3
*.webm
*.mkv
*.part
*.log

npm-debug.log*
yarn-debug.log*

.DS_Store
Thumbs.db

.vscode/
.idea/
```

---

# 🔐 Security

Never upload:

```text
.env
API keys
Passwords
Access tokens
Private credentials
Downloaded videos
Private files
```

Before pushing to GitHub:

```bash
git status
```

Review the files carefully.

---

# 🧹 Docker Cleanup

Remove stopped containers:

```bash
docker container prune
```

Remove unused images:

```bash
docker image prune
```

Remove unused Docker resources:

```bash
docker system prune
```

> Be careful with Docker cleanup commands because they can remove unused containers, images, networks, or build cache.

---

# 🩺 Troubleshooting

## Git is not recognized

If Windows shows:

```text
git is not recognized
```

Install Git for Windows and restart PowerShell.

Check:

```bash
git --version
```

---

## `src refspec main does not match any`

This usually means there is no commit yet.

Run:

```bash
git add .
git commit -m "Initial commit"
git branch -M main
git push -u origin main
```

---

## Git identity error

Run:

```bash
git config --global user.name "Vishwajeet1112"
git config --global user.email "YOUR_GITHUB_EMAIL"
```

Then:

```bash
git commit -m "Initial commit"
```

---

## Docker container is not running

Check:

```bash
docker ps -a
```

View logs:

```bash
docker logs yt-downloader-backend
```

Restart:

```bash
docker restart yt-downloader-backend
```

Or rebuild:

```bash
docker compose down
docker compose up -d --build
```

---

## Port 8080 already in use

Check:

```powershell
netstat -ano | findstr :8080
```

Check port 3001:

```powershell
netstat -ano | findstr :3001
```

Stop the process if necessary or change the Docker port mapping.

---

## Check Backend Container

```bash
docker ps
```

Expected:

```text
0.0.0.0:3001->3001/tcp
```

---

## Check Frontend Container

Expected:

```text
0.0.0.0:8080->80/tcp
```

---

# 🔄 Complete Fresh Installation

For a new Windows machine:

```powershell
git clone https://github.com/Vishwajeet1112/yt-downloader.git
```

```powershell
cd yt-downloader
```

```powershell
docker compose up -d --build
```

Check:

```powershell
docker ps
```

Open:

```text
http://localhost:8080
```

That's it.

---

# 📱 Application Flow

```text
                    User
                     │
                     ▼
              Paste Video URL
                     │
                     ▼
                 Analyze
                     │
                     ▼
              Video Information
                     │
                     ▼
              Select Quality
                     │
                     ▼
             Select Folder
                     │
                     ▼
               Start Download
                     │
                     ▼
                  Backend
                     │
                     ▼
                  yt-dlp
                     │
                     ▼
              Download Process
                     │
                     ▼
              Progress / SSE
                     │
                     ▼
                 Completed
                     │
                     ▼
                Save File
```

---

# 🎯 Project Goals

The project aims to provide:

- Simple web-based video downloading
- Command-line-free user experience
- Playlist downloading
- Quality selection
- Download queue management
- Real-time progress
- Duplicate filtering
- Download retry functionality
- Docker-based deployment
- User-controlled file saving
- Modular frontend/backend architecture

---

# 🚀 Future Improvements

Possible future improvements:

- User authentication
- Persistent database
- Download history
- Download scheduling
- Multiple simultaneous downloads
- Download speed limits
- Background job queue
- Cloud storage
- S3 integration
- Better playlist resume
- WebSocket support
- User accounts
- Download statistics
- Production VPS deployment
- HTTPS
- Reverse proxy
- Cloudflare integration

---

# ⚠️ Disclaimer

This project is intended for downloading content that the user has permission to download or that is legally available for downloading.

Users are responsible for complying with the terms of service, copyright laws, and applicable laws and regulations when using this software.

---

# 👨‍💻 Author

**Vishwajeet1112**

GitHub:

https://github.com/Vishwajeet1112

Repository:

https://github.com/Vishwajeet1112/yt-downloader

---

# ⭐ Support

If you find this project useful, consider giving the repository a ⭐ on GitHub.

---

# 📄 License

Add an appropriate open-source license to this repository before distributing the project publicly.
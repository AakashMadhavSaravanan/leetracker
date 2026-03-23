# 🏆 Hybrid LeetCode Progress Tracker

A full-stack web application where trainers can easily assign LeetCode problems and study notes, and students can submit their solutions with a 3-layer verification engine.

## 🏗️ Architecture

```text
┌─────────────────────────────────────────────┐
│           USER (Browser / Mobile)           │
└─────────────────┬───────────────────────────┘
                  │ HTTPS
┌─────────────────▼───────────────────────────┐
│         FRONTEND — Vercel (Free)            │
│  React 18 + TailwindCSS                     │
│  Auto-deploy from GitHub (main branch)      │
└─────────────────┬───────────────────────────┘
                  │ REST API calls
┌─────────────────▼───────────────────────────┐
│      BACKEND API — Render (Free)            │
│  Node.js + Express                          │
│  ⚠️ Sleeps after 15min → keep-alive ping    │
└────────┬────────────────────┬───────────────┘
         │                    │
┌────────▼──────────┐ ┌───────▼────────────────┐
│  MongoDB Atlas    │ │  Cloudinary (Free)      │
│  Free M0 Cluster  │ │  PDF, DOCX, Screenshots │
│  512MB storage    │ │  25GB bandwidth/month   │
└───────────────────┘ └─────────────────────────┘
         │
┌────────▼────────────────────────────────────┐
│   PYTHON MICROSERVICE — Render (Free)       │
│   FastAPI + Tesseract + pdfplumber          │
│   ⚠️ Sleeps after 15min → retry logic       │
└─────────────────────────────────────────────┘
```

## 🚀 Local Setup

### 1. Database & Cloud Services
1. Set up a free **MongoDB Atlas** M0 Cluster.
2. Create a free **Cloudinary** account and obtain your Cloud Name, API Key, and API Secret.

### 2. Python Verification Microservice
```bash
cd verification-service
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000
```

### 3. Backend API
```bash
cd backend
npm install
# Configure your .env
npm run seed  # Seed the database
npm run dev
```

### 4. Frontend
```bash
cd frontend
npm install
# Configure your .env
npm run dev
```

## ⚙️ Environment Variables

### `backend/.env`
| Variable | Description |
|---|---|
| `PORT` | 5000 |
| `NODE_ENV` | `development` or `production` |
| `MONGODB_URI` | MongoDB Atlas Connection String |
| `JWT_SECRET` | Secret for Access Token (min 32 chars) |
| `JWT_REFRESH_SECRET` | Secret for Refresh Token (min 32 chars) |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary Cloud Name |
| `CLOUDINARY_API_KEY` | Cloudinary API Key |
| `CLOUDINARY_API_SECRET` | Cloudinary API Secret |
| `PYTHON_SERVICE_URL` | URL of your Python Microservice |
| `CLIENT_URL` | URL of your Frontend application |

### `verification-service/.env`
| Variable | Description |
|---|---|
| `PORT` | 8000 |
| `ALLOWED_ORIGINS` | Comma separated allowed origins for CORS |
| `MAX_FILE_SIZE_MB` | 10 |

### `frontend/.env`
| Variable | Description |
|---|---|
| `VITE_API_BASE_URL` | Backend URL (e.g., `http://localhost:5000/api`) |
| `VITE_CLOUDINARY_CLOUD_NAME` | Cloudinary Cloud Name |

## 🔁 Full API Reference

### Auth
- `POST /api/auth/register` — Trainer only (self-register)
- `POST /api/auth/login` — Returns accessToken + refreshToken
- `POST /api/auth/refresh` — Rotate tokens

### Problems
- `POST /api/problems` — Trainer creates problem
- `GET /api/problems` — Trainer sees all; student sees assigned only
- `PATCH /api/problems/:id/assign` — Trainer assigns to student(s)

### Submissions
- `GET /api/submissions/token/:problemId` — Student gets unique token
- `POST /api/submissions` — Student submits solution
- `GET /api/submissions/mine` — Student's own submissions
- `GET /api/submissions/all` — Trainer sees all submissions

### Notes
- `POST /api/notes` — Trainer uploads note (multipart/form-data)
- `GET /api/notes` — Trainer sees all; student sees assigned + published
- `GET /api/notes/:id` — Single note + content + questions
- `PATCH /api/notes/:id/assign` — Trainer assigns to student(s)
- `PATCH /api/notes/:id/publish` — Trainer toggles publish
- `PATCH /api/notes/:id/complete` — Student marks note complete
- `POST /api/notes/:id/highlight` — Student saves highlight
- `DELETE /api/notes/:id/highlight/:hlId` — Student removes highlight
- `GET /api/notes/search?q=keyword` — Full-text search (rate limited)
- `POST /api/notes/:id/questions` — Trainer adds LeetCode questions
- `GET /api/notes/:id/questions` — Get questions for note
- `DELETE /api/notes/:id/questions/:qId` — Trainer removes question

### Leaderboard
- `GET /api/leaderboard` — Get ranked students with score, solved count, and streak

## ✅ Verification Engine (3 Layers)

1. **Layer 1 — Token Check**: A unique token (e.g. `USR7A2_4891`) is generated for the student/problem combination. The student places it in a comment in their code. The system checks if this token exists within the submitted code payload.
2. **Layer 2 — OCR Scanning**: Tesseract parses the uploaded screenshot. It looks for the student's exactly formatted LeetCode username, the word "Accepted", the specific token string, and performs a fuzzy match (>= 80% similarity) on the problem title. Any missed component fails this layer.
3. **Layer 3 — Code Similarity**: Scikit-Learn's `TfidfVectorizer` calculates Cosine Similarity between the student's submitted code and the provided reference solution. A score >= 0.30 passes.

*Scoring Bonus:* Passing 3 layers yields a 1.0x bonus, 2 layers gives 0.6x.

## 📊 Notes Extraction Pipeline

When a Trainer uploads a `.pdf` or `.docx` file:
1. Backend validates that it's under 10MB and the correct type.
2. The file buffer is converted to a base64 string and sent over REST to the Python Microservice.
3. The Microservice uses `pdfplumber` or `python-docx` to extract raw text paragraph-by-paragraph, ignoring images. Word counts and errors (like password protection) are reported.
4. The text is truncated to 50,000 characters and assigned to the MongoDB model with a `$text` index to enable ultra-fast debounced searching for students.

## 📦 Deployment Guide

1. **MongoDB Atlas**
   - Create M0 cluster → Add DB user → Allow 0.0.0.0/0 IP access.
   - Copy connection string to `MONGODB_URI`.
2. **Cloudinary**
   - Head to Settings -> Security to enable Unsigned Uploads.
   - Copy Cloud Name, API Key, and Secret to `backend/.env`.
3. **Python Service (Render)**
   - Create New Web Service connected to `verification-service/`.
   - Build command: `pip install -r requirements.txt`.
   - Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`.
   - Add proper Custom Domains and copy the deployed URL and place in `PYTHON_SERVICE_URL`.
4. **Backend (Render)**
   - Create New Web Service connected to `backend/`.
   - Build command: `npm install`.
   - Start command: `node src/app.js`.
   - Set all ENV variables. Copy this URL to the Frontend's env vars.
5. **Frontend (Vercel)**
   - Import the `frontend/` directory into Vercel.
   - Use `Vite` framework preset.
   - Enter `VITE_API_BASE_URL` and `VITE_CLOUDINARY_CLOUD_NAME`.
   - Deploy.

## 💸 Free Tier Limits & Mitigations

| Service | Free Limit | Mitigation Strategy |
|---|---|---|
| **Vercel** | 100GB bandwidth/mo | Used strictly for static assets (React bundle). |
| **Render (Backend)** | 750 hrs/mo, sleeps 15min | The Python API has a cronjob health ping setup inside the Node.js backend. |
| **Render (Python)** | 750 hrs/mo, sleeps 15min | Set up **UptimeRobot** free tier. |
| **MongoDB Atlas** | 512MB, M0 cluster | `content_text` is hard-capped at 50,000 characters to prevent storage runaway. Database indexing is minimized. |
| **Cloudinary** | 25GB bandwidth, 10GB storage | Recommend deleting original PDFs off Cloudinary once `content_text` is extracted if storage becomes an issue. |

### UptimeRobot Setup
To prevent your Render apps from sleeping natively on the free tier, sign up for [UptimeRobot](https://uptimerobot.com/). Create two "HTTP(s)" monitors targeting your Render Backend URL (`/health`) and your Render Python URL (`/health`) set with a 14-minute interval constraint.

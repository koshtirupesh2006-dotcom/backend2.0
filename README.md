# Akatsuki’s Draft – AI-Enabled Content Sharing Platform

A clean, beginner-friendly backend API built with **Node.js**, **Express.js**, **MongoDB (Mongoose)**, **JWT Authentication**, **Multer**, and **Google Gemini AI**.

Designed for college-level learning and real-world software engineering fundamentals, adhering to standard MVC (Model-View-Controller) architecture.

---

## 🚀 Features

1. **Authentication & Authorization**
   - User Registration with name, email, and password.
   - Secure password hashing using `bcryptjs`.
   - Token-based authentication using **JSON Web Tokens (JWT)**.
   - Dual roles: `user` and `admin`.
   - Protected user profile endpoint (`GET /auth/me`).

2. **Post & Draft Management**
   - Create posts as drafts or submit them for approval (`draft`, `pending`).
   - Public view for all approved posts (`GET /posts`).
   - Private view for users to see all their own posts and drafts (`GET /posts/my-posts`).
   - Strict ownership protection: Users can only edit or delete their own posts.

3. **Admin Content Moderation**
   - Admin-only routes to review pending posts (`GET /admin/posts/pending`).
   - One-click approval (`PATCH /admin/posts/approve/:id`) and rejection (`PATCH /admin/posts/reject/:id`).
   - Public visitors only see approved posts.

4. **Gemini AI Content Improvement**
   - Enhances post grammar, vocabulary, clarity, and tone with Google Gemini AI (`POST /ai/improve/:postId`).
   - **Non-destructive**: Preserves the original post and saves the AI-enhanced version as a **new draft with a new ID** belonging to the same user.

5. **Gemini AI Document Upload & Processing**
   - Upload documents (PDF, TXT, Markdown, CSV, HTML, RTF) via Multer (`POST /ai/process-document`).
   - Sends document data inline using base64 encoding following the [Official Google Gemini Document Processing Guide](https://ai.google.dev/gemini-api/docs/document-processing?authuser=1#javascript).
   - Generates automated executive summaries, key takeaways, and structured insights.

---

## 🛠️ Technology Stack

- **Runtime:** Node.js (v18+)
- **Framework:** Express.js (v4)
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JWT (`jsonwebtoken`) & `bcryptjs`
- **File Uploads:** Multer (memory storage for seamless buffer to base64 conversion)
- **AI Integration:** Official Google Gen AI SDK (`@google/genai`) with fallback support for `@google/generative-ai`

---

## 📂 Project Structure

```text
Project 4.0/
├── controllers/
│   ├── adminController.js     # Admin pending list, approve, and reject logic
│   ├── aiController.js        # Gemini AI content improve & document processing
│   ├── authController.js      # User registration, login, and profile
│   └── postController.js      # Post CRUD, draft handling, public & my-posts feed
├── middleware/
│   ├── authMiddleware.js      # JWT token verification (protect) & admin check
│   └── uploadMiddleware.js    # Multer configuration and document MIME validation
├── models/
│   ├── Post.js                # Post schema (title, description, content, status, etc.)
│   └── User.js                # User schema (name, email, password, role)
├── routes/
│   ├── adminRoutes.js         # /admin/posts/* routes
│   ├── aiRoutes.js            # /ai/* routes
│   ├── authRoutes.js          # /auth/* routes
│   └── postRoutes.js          # /posts/* routes
├── .env.example               # Environment variables template
├── .gitignore                 # Ignores node_modules, .env, and sensitive files
├── package.json               # Dependencies and npm scripts
├── README.md                  # Project documentation & Postman guide
└── server.js                  # Application entry point & DB connection
```

---

## 📋 Database Schemas

### 1. User Schema (`models/User.js`)
| Field | Type | Required | Description |
|---|---|---|---|
| `name` | String | Yes | Full name of the user |
| `email` | String | Yes | Unique, lowercase email address |
| `password` | String | Yes | Hashed password (omitted in JSON output) |
| `role` | String | Yes | Enum: `'user'` (default) or `'admin'` |
| `createdAt`| Date | Auto | Timestamp of account registration |

### 2. Post Schema (`models/Post.js`)
| Field | Type | Required | Description |
|---|---|---|---|
| `title` | String | Yes | Title of the post |
| `description` | String | Yes | Short summary or teaser |
| `content` | String | Yes | Body content |
| `image` | String | No | URL or path to post image |
| `category` | String | Yes | Post category (default: `'General'`) |
| `createdBy` | ObjectId | Yes | References `User` model |
| `status` | String | Yes | Enum: `'draft'`, `'pending'`, `'approved'`, `'rejected'` |
| `createdAt` | Date | Auto | Timestamp of post creation |

---

## ⚙️ Installation & Local Setup

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (version 18 or above recommended)
- [MongoDB](https://www.mongodb.com/try/download/community) installed locally, or a free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cloud URI.

### 2. Clone / Open Directory
Open your terminal in the project root:
```bash
cd "c:\Users\cheta\Desktop\Project 4.0"
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Open `.env` and fill in your values:
```env
PORT=5000
NODE_ENV=development

# Local MongoDB
MONGODB_URI=mongodb://127.0.0.1:27017/akatsukis-draft
# Or MongoDB Atlas:
# MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/akatsukis-draft?retryWrites=true&w=majority

# JWT Secret
JWT_SECRET=akatsukis_draft_jwt_secret_key_2026_secure

# Gemini AI API Configuration
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash
```

### 5. Obtaining a Free Google Gemini API Key
1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey).
2. Sign in with your Google account.
3. Click **"Create API key"**.
4. Copy the generated key string and paste it as `GEMINI_API_KEY` in your `.env` file.

### 6. Start the Server
- **Production / Standard Mode:**
  ```bash
  npm start
  ```
- **Development Mode (Auto-reload on changes with Nodemon):**
  ```bash
  npm run dev
  ```

You will see:
```text
[Database] MongoDB connected successfully to mongodb://127.0.0.1:27017/akatsukis-draft
[Server] Akatsuki’s Draft backend is running on http://localhost:5000
```

---

## 📮 API Endpoints & Postman Testing Guide

All protected endpoints require the header:
```text
Authorization: Bearer <your_jwt_token>
```

> **Note:** The server supports both `/endpoint` and `/api/endpoint` (e.g., both `/posts` and `/api/posts` work interchangeably).

### 1. Authentication

#### Register a Regular User
- **Method & URL:** `POST http://localhost:5000/auth/register`
- **Body (JSON):**
  ```json
  {
    "name": "Naruto Uzumaki",
    "email": "naruto@leaf.org",
    "password": "Password123",
    "role": "user"
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "success": true,
    "message": "User registered successfully.",
    "token": "eyJhbGciOiJIUzI1NiIsInR5c...",
    "user": {
      "_id": "671fb2a19c1234567890abcd",
      "name": "Naruto Uzumaki",
      "email": "naruto@leaf.org",
      "role": "user",
      "createdAt": "2026-10-27T17:45:00.000Z"
    }
  }
  ```

#### Register an Admin User
- **Method & URL:** `POST http://localhost:5000/auth/register`
- **Body (JSON):**
  ```json
  {
    "name": "Pain / Nagato",
    "email": "admin@akatsuki.org",
    "password": "AdminPassword123",
    "role": "admin"
  }
  ```

#### User Login
- **Method & URL:** `POST http://localhost:5000/auth/login`
- **Body (JSON):**
  ```json
  {
    "email": "naruto@leaf.org",
    "password": "Password123"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Login successful.",
    "token": "eyJhbGciOiJIUzI1NiIsInR5c...",
    "user": {
      "_id": "671fb2a19c1234567890abcd",
      "name": "Naruto Uzumaki",
      "email": "naruto@leaf.org",
      "role": "user"
    }
  }
  ```

#### Get Current Logged-in User
- **Method & URL:** `GET http://localhost:5000/auth/me`
- **Headers:** `Authorization: Bearer <token>`
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "user": {
      "_id": "671fb2a19c1234567890abcd",
      "name": "Naruto Uzumaki",
      "email": "naruto@leaf.org",
      "role": "user",
      "createdAt": "2026-10-27T17:45:00.000Z"
    }
  }
  ```

---

### 2. Post Management

#### Create a Post (Draft or Submit for Approval)
- **Method & URL:** `POST http://localhost:5000/posts`
- **Headers:** `Authorization: Bearer <token>`
- **Body (JSON):**
  ```json
  {
    "title": "A Will of Fire Manifesto",
    "description": "Thoughts on community resilience and peace.",
    "content": "Peace is not the absence of conflict but the presence of empathy and mutual understanding.",
    "image": "https://example.com/will-of-fire.jpg",
    "category": "Philosophy",
    "status": "pending"
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "success": true,
    "message": "Post created and submitted for admin approval.",
    "post": {
      "_id": "671fb3d29c1234567890ef01",
      "title": "A Will of Fire Manifesto",
      "description": "Thoughts on community resilience and peace.",
      "content": "Peace is not the absence of conflict but the presence of empathy and mutual understanding.",
      "image": "https://example.com/will-of-fire.jpg",
      "category": "Philosophy",
      "createdBy": "671fb2a19c1234567890abcd",
      "status": "pending",
      "createdAt": "2026-10-27T17:50:00.000Z"
    }
  }
  ```

#### View All Approved Posts (Public Feed)
- **Method & URL:** `GET http://localhost:5000/posts`
- **Access:** Public (No token required)
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "count": 1,
    "posts": [
      {
        "_id": "671fb3d29c1234567890ef01",
        "title": "A Will of Fire Manifesto",
        "description": "Thoughts on community resilience and peace.",
        "content": "...",
        "image": "https://example.com/will-of-fire.jpg",
        "category": "Philosophy",
        "status": "approved",
        "createdBy": {
          "_id": "671fb2a19c1234567890abcd",
          "name": "Naruto Uzumaki",
          "email": "naruto@leaf.org"
        },
        "createdAt": "2026-10-27T17:50:00.000Z"
      }
    ]
  }
  ```

#### View Logged-in User's Posts and Drafts
- **Method & URL:** `GET http://localhost:5000/posts/my-posts`
- **Headers:** `Authorization: Bearer <token>`
- **Optional Query Params:** `?status=draft` or `?status=pending`
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "count": 2,
    "posts": [...]
  }
  ```

#### View Post by ID
- **Method & URL:** `GET http://localhost:5000/posts/:id`
- **Access:** Public if `approved`; accessible to the author/admin if in `draft` or `pending`.

#### Update User's Own Post
- **Method & URL:** `PATCH http://localhost:5000/posts/:id`
- **Headers:** `Authorization: Bearer <token>`
- **Body (JSON):**
  ```json
  {
    "title": "A Will of Fire Manifesto (Revised)",
    "status": "pending"
  }
  ```

#### Delete User's Own Post
- **Method & URL:** `DELETE http://localhost:5000/posts/:id`
- **Headers:** `Authorization: Bearer <token>`
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Post deleted successfully."
  }
  ```

---

### 3. Admin Moderation

#### View Posts Awaiting Approval
- **Method & URL:** `GET http://localhost:5000/admin/posts/pending`
- **Headers:** `Authorization: Bearer <admin_token>`
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "count": 1,
    "posts": [
      {
        "_id": "671fb3d29c1234567890ef01",
        "title": "A Will of Fire Manifesto",
        "status": "pending",
        "createdBy": {
          "_id": "671fb2a19c1234567890abcd",
          "name": "Naruto Uzumaki",
          "email": "naruto@leaf.org"
        }
      }
    ]
  }
  ```

#### Approve a Post
- **Method & URL:** `PATCH http://localhost:5000/admin/posts/approve/:id`
- **Headers:** `Authorization: Bearer <admin_token>`
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Post approved successfully. It is now visible to the public.",
    "post": {
      "_id": "671fb3d29c1234567890ef01",
      "status": "approved"
    }
  }
  ```

#### Reject a Post
- **Method & URL:** `PATCH http://localhost:5000/admin/posts/reject/:id`
- **Headers:** `Authorization: Bearer <admin_token>`
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Post rejected.",
    "post": {
      "_id": "671fb3d29c1234567890ef01",
      "status": "rejected"
    }
  }
  ```

---

### 4. Gemini AI Integration

#### Improve Post Content with AI
- **Method & URL:** `POST http://localhost:5000/ai/improve/:postId`
- **Headers:** `Authorization: Bearer <token>`
- **Behavior:**
  - Pulls the original post's text.
  - Sends it to Gemini AI with prompt instructions to fix grammar, clarity, and readability without changing the core meaning.
  - **Saves the output as a brand new draft with a fresh ID** for the logged-in user.
  - Leaves the original post intact.
- **Response (201 Created):**
  ```json
  {
    "success": true,
    "message": "Post content improved by Gemini AI and saved as a new draft successfully.",
    "originalPostId": "671fb3d29c1234567890ef01",
    "newDraftPost": {
      "_id": "671fb45a9c12345678901234",
      "title": "A Will of Fire Manifesto (AI Improved)",
      "description": "Thoughts on community resilience and peace.",
      "content": "True peace is achieved not through the sheer avoidance of strife, but through active empathy, persistent dialogue, and mutual understanding among communities.",
      "category": "Philosophy",
      "createdBy": "671fb2a19c1234567890abcd",
      "status": "draft",
      "createdAt": "2026-10-27T17:55:00.000Z"
    }
  }
  ```

#### Upload & Process Document with Gemini AI
- **Method & URL:** `POST http://localhost:5000/ai/process-document`
- **Headers:**
  - `Authorization: Bearer <token>`
  - `Content-Type: multipart/form-data`
- **Body (`form-data` in Postman):**
  - Key: `document` (Type: **File**) -> Select a PDF, TXT, MD, or CSV file.
  - Key: `prompt` (Type: **Text**, *Optional*) -> e.g. `"Summarize the key findings and recommendations in bullet points."`
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Document analyzed and processed successfully by Gemini AI.",
    "file": {
      "originalName": "research_report.pdf",
      "mimeType": "application/pdf",
      "sizeBytes": 142058
    },
    "promptUsed": "Summarize the key findings and recommendations in bullet points.",
    "analysis": "### Executive Summary\n\nThis research paper explores modern AI-assisted content distribution...\n\n### Key Takeaways:\n- 1. Integration of multimodal document understanding saves over 40% in editing turnaround.\n- 2. Content quality scores improved significantly after contextual grammar revision.\n\n### Recommendations:\n- Implement role-based editorial gates before publishing to production."
  }
  ```

---

## 🛡️ Security Best Practices Applied

1. **Passwords:** Hashed with `bcryptjs` using 10 salt rounds before saving to database. Password hashes are automatically stripped from API output via `User.toJSON()`.
2. **Secrets:** All credentials (`JWT_SECRET`, `GEMINI_API_KEY`, `MONGODB_URI`) reside exclusively in `.env` and are excluded from git commits via `.gitignore`.
3. **Authorization:** Strict role verification prevents regular users from calling admin approval routes, and strict user ID comparison prevents users from updating or deleting posts created by others.
4. **AI Safety:** AI text improvement is completely non-destructive: original user drafts are never overwritten.


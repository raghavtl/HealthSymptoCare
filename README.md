# 🩺 HealthSymptoCare – AI-powered-Full Stack Health Management System

HealthSymptoCare is a **full-stack health management web application** that provides symptom checking, wellness tracking, health tips, reminders, and role-based authentication (User & Admin).

The project is designed to be **clone-and-run ready**, meaning **anyone can clone the repository and run it locally without any manual database setup**.

---

## ✨ Features

### 👤 Authentication
- User registration and login
- Admin login
- JWT-based authentication
- Secure password hashing using bcrypt

### 🗄️ Database
- SQLite (file-based database)
- **Database and tables are auto-created on first run**
- Default admin account is auto-generated

### 🧠 Health Modules
- Symptom checker
- Wellness logs
- Health tips
- Diet & fitness recommendations
- Medicine information
- Email reminders with scheduler

### 🖥️ Applications Included
- Frontend (User Application)
- Admin Panel
- Backend REST API

---

## 🧱 Tech Stack

### Frontend
- React (Vite)
- Axios
- JWT Authentication

### Backend
- Node.js
- Express.js
- SQLite
- bcryptjs
- jsonwebtoken
- nodemailer
- helmet & cors

---

## 📁 Project Structure
HealthSymptoCare/
│
├── backend/
│ ├── config/ # Database configuration & auto-init
│ ├── database/ # SQLite database folder (auto-created)
│ ├── middleware/ # Auth, validation & error handlers
│ ├── models/ # Database models
│ ├── routes/ # API routes
│ ├── utils/ # Mailer & helpers
│ ├── server.js # Backend entry point
│ └── package.json
│
├── frontend/ # User frontend (React)
│
├── admin/ # Admin panel (React)
│
├── .env.example # Environment variables template
└── README.md


// Important

---

## ⚙️ Prerequisites

Make sure you have the following installed:

- **Node.js v16 or above**
- **npm**
- **Git**

Check versions:
```bash
node -v
npm -v
git --version


🚀 How to Run the Project (Clone & Run)
1️⃣ Clone the Repository
git clone https://github.com/<your-username>/HealthSymptoCare.git
cd HealthSymptoCare

2️⃣ Backend Setup
cd backend
npm install


Create .env file:

cp .env.example .env


Example .env:

PORT=5000
JWT_SECRET=supersecretkey
JWT_EXPIRES_IN=7d
NODE_ENV=development


Start backend:

npm start


✅ On first run:

SQLite database is created automatically

All tables are created automatically

Default admin user is created automatically

3️⃣ Default Admin Credentials
Email: admin@healthcare.com
Password: Admin@123


⚠️ Change these credentials after first login.

4️⃣ Frontend (User Application)
cd ../frontend
npm install
npm run dev


Runs at:

http://localhost:5173

5️⃣ Admin Panel
cd ../admin
npm install
npm run dev


Runs at:

http://localhost:5174

🔐 Authentication Flow

User registers → data stored in SQLite

Login verifies password using bcrypt

JWT token is issued for protected APIs

Role-based access control (user, admin)

🗃️ Database Behavior

No manual database setup required

SQLite database file is created at:

backend/database/healthsymptocare.db


Tables are auto-created on server start

Deleting the DB file will recreate it on next run

🔁 Reset Database (Optional)

API endpoint:

POST /api/reset-database


Resets all tables and recreates schema.

📦 GitHub & Usage Notes

node_modules is not committed

.env is not committed

.env.example is provided

SQLite database file is auto-generated locally

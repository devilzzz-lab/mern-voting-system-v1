
# MERN Voting System with Facial Recognition

## 📌 Version 1.0.0 – Initial Release

A secure and modern voting system built using the MERN stack with integrated facial recognition for identity verification. This is the first complete version of the application.

---

## 🚀 Features

- 🗳️ Voter Registration & Login (via Aadhaar, Phone, or Email)
- 🔐 Facial Recognition (Registration & Verification)
- 👤 Role-Based Access: Admin, User, Candidate
- 🔄 One Vote Per User Policy
- 📊 Admin Dashboard with Voting Statistics
- 🛠️ Election Control (Start/Stop by Admin)
- 📤 Export Data as CSV/PDF
- ✅ Prevent Duplicate Voting via Face + Vote Check

---

## 🛠️ Technologies Used

- **Frontend**: React.js, Bootstrap, Chart.js, Face API
- **Backend**: Node.js, Express.js, MongoDB (Mongoose)
- **Auth**: JWT Tokens
- **Face Recognition**: face-api.js
- **Data Export**: html2pdf.js, PapaParse

---

## 📁 Project Structure

```
mern-voting-system/
│
├── client/                        # React Frontend
│   ├── public/
│   │   └── models/                # face-api.js models
│   ├── src/
│   │   ├── components/            # Register, Dashboard, FaceRegister, FaceVerify
│   │   └── api.js                 # Axios API setup
│   └── config-overrides.js        # Custom Webpack config
│
├── server/                        # Node.js Backend
│   ├── controllers/               # Controller logic for routes
│   ├── middleware/                # Auth and other middlewares
│   ├── models/                    # Mongoose models
│   ├── routes/                    # Express route handlers
│   ├── utils/                     # Utility functions (e.g., faceRecognitionUtils.js)
│   ├── createAdmin.js             # Script to initialize default admin
│   └── server.js                  # Entry point for backend
```

---

## 📡 API Endpoints Summary

### 🔐 Authentication
- `POST /api/user/register` – Register new user
- `POST /api/user/login` – User login
- `POST /api/admin/login` – Admin login
- `POST /api/candidate/login` – Candidate login

### 🗳️ Election Control (Admin Only)
- `POST /api/election/start` – Start the election
- `POST /api/election/end` – End the election
- `GET /api/election/status` – Internal status check (Admin use)
- `GET /api/election/public-state` – Public election status (Any user)

### 🧑‍💼 Candidate Management (Admin Only)
- `POST /api/candidate/add-candidate` – Add a candidate

### 🗳️ Voting
- `POST /api/election/vote` – Cast a vote (User Only)
- `GET /api/vote/stats` – View voting stats (Admin Only)

### 🧠 Facial Recognition
- `POST /api/face/register` – Register facial data
- `POST /api/face/verify` – Verify face before voting

---

## ❓ Should You Ignore `config-overrides.js`?

**No**, you should **NOT** ignore it.

- `config-overrides.js` is important because it customizes your React app’s Webpack config using `react-app-rewired`.
- It’s part of your build setup and **must be committed** for others to run the project.

So **do NOT add it to `.gitignore`**.

---

## 📦 Setup Instructions

### Backend Setup
```bash
cd server
npm install
npm run dev
```

### Frontend Setup
```bash
cd client
npm install
npm start
```

> Make sure to configure your `.env` files with correct MongoDB URI and JWT secret.

---

## 📈 Future Improvements

- OTP or Email Verification for Voter Login
- Blockchain Integration for Vote Integrity
- Real-time Vote Result Charts
- Admin/Candidate Notification System
- Improved Face Matching and Fallback Options

---

## 📜 License

This project is licensed for academic/demo purposes. All rights reserved by the author.

---

## 🧠 Note

This is **Version 1**. Future updates will be released as **v2**, **v3**, etc. under this repository or new branches/tags.

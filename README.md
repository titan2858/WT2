# 🧠 CogniCare — Cognitive Assessment Platform

A full-stack web application for conducting standardized cognitive tests for patients.

## Tech Stack
- **Frontend:** React.js + Tailwind CSS
- **Backend:** Python + FastAPI
- **Database:** MongoDB (Motor async driver)
- **Auth:** JWT (jose)

## Project Structure
```
cognicare/
├── backend/
│   ├── app/
│   │   ├── api/routes/       # FastAPI route handlers
│   │   ├── core/             # Config, security, JWT
│   │   ├── db/               # MongoDB connection
│   │   ├── models/           # Pydantic DB models
│   │   ├── schemas/          # Request/Response schemas
│   │   └── services/         # Business logic
│   ├── main.py
│   └── requirements.txt
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── tests/        # 8 cognitive test components
    │   │   ├── dashboard/    # Doctor & Patient dashboards
    │   │   ├── auth/         # Login / Signup
    │   │   └── shared/       # Reusable UI components
    │   ├── pages/            # Page-level components
    │   ├── hooks/            # Custom React hooks
    │   ├── services/         # Axios API calls
    │   ├── store/            # Zustand state management
    │   └── styles/           # Global CSS
    ├── package.json
    └── tailwind.config.js
```

## 8 Cognitive Tests
1. Serial Subtraction (Attention & Calculation)
2. Word Recall (Short-term Memory)
3. Clock Drawing Test (Visuospatial)
4. Trail Making Test (Executive Function)
5. Orientation Questions (Memory & Awareness)
6. Digit Span Test (Working Memory)
7. Pattern Recognition (Visual Memory)
8. Verbal Fluency Test (Language & Memory)

## Setup Instructions

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env       # Fill in your MongoDB URI & JWT secret
uvicorn main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env       # Set REACT_APP_API_URL=http://localhost:8000
npm start
```

## Environment Variables

### Backend `.env`
```
MONGODB_URL=mongodb://localhost:27017
DB_NAME=cognicare
JWT_SECRET=your-super-secret-key-change-this
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=1440
```

### Frontend `.env`
```
REACT_APP_API_URL=http://localhost:8000
```

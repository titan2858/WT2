from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.db.database import connect_db, close_db
from app.api.routes import auth, patients, sessions, results
 
app = FastAPI(
    title="CogniCare API",
    description="Cognitive Assessment Platform for Patients",
    version="1.0.0"
)
 
# CORS — allow React dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)
 
# DB lifecycle
app.add_event_handler("startup", connect_db)
app.add_event_handler("shutdown", close_db)
 
# Routers
app.include_router(auth.router)
app.include_router(patients.router)
app.include_router(sessions.router)
app.include_router(results.router)
 
 
@app.get("/")
async def root():
    return {"message": "🧠 CogniCare API is running", "docs": "/docs"}
 
 
@app.get("/health")
async def health():
    return {"status": "ok"}
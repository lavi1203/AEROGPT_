from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy import Column, Integer, String, create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from passlib.context import CryptContext
from jose import jwt
from datetime import datetime, timedelta

import os
from dotenv import load_dotenv
from google import genai

# -----------------------------
# CONFIG
# -----------------------------
SECRET_KEY = "AEROGPT_SECRET_KEY_12345"  # change in production
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

DATABASE_URL = "sqlite:///./users.db"

# -----------------------------
# DATABASE SETUP
# -----------------------------
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()

# -----------------------------
# PASSWORD HASHING
# -----------------------------
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# -----------------------------
# USER MODEL (TABLE)
# -----------------------------
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)

Base.metadata.create_all(bind=engine)

# -----------------------------
# FASTAPI APP
# -----------------------------
app = FastAPI(title="AeroGPT Backend (Auth + Chatbot)")

# -----------------------------
# CORS (React Connection)
# -----------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # allow React
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------------
# GEMINI CONFIG
# -----------------------------
load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if GEMINI_API_KEY:
    gemini_client = genai.Client(api_key=GEMINI_API_KEY)
else:
    gemini_client = None
    print("⚠️ GEMINI_API_KEY not found. Gemini chat will not work.")

# -----------------------------
# REQUEST SCHEMAS
# -----------------------------
class SignupRequest(BaseModel):
    name: str
    email: str
    password: str

class LoginRequest(BaseModel):
    email: str
    password: str

class ChatRequest(BaseModel):
    messages: list

# -----------------------------
# OFFLINE KB
# -----------------------------
OFFLINE_KB = {
    "chandrayaan-3":
        "Chandrayaan-3 is ISRO's third lunar mission launched in 2023.\n\n"
        "Components:\n1) Propulsion Module\n2) Vikram Lander\n3) Pragyan Rover\n\n"
        "It successfully soft-landed on 23 August 2023 near the lunar south pole.",

    "escape velocity":
        "Escape velocity is the minimum speed required for an object to escape gravity.\n\n"
        "Formula:\nv = √(2GM/R)\n\nEarth escape velocity ≈ 11.2 km/s.",

    "tsiolkovsky":
        "Tsiolkovsky Rocket Equation:\n\nΔv = Ve ln(m0/mf)\n\n"
        "Ve = exhaust velocity\nm0 = initial mass\nmf = final mass",

    "hamming distance":
        "Hamming distance is the number of positions where bits differ.\n\n"
        "Example:\n1011101\n1001001\nHamming distance = 2",

    "voyager":
        "Voyager 1 and Voyager 2 are NASA spacecraft launched in 1977.\n\n"
        "Voyager 1 entered interstellar space in 2012.",

    "dijkstra":
        "Dijkstra's Algorithm finds shortest paths in a weighted graph with non-negative weights.\n\n"
        "Time Complexity:\nO(V²) (array)\nO((V+E)logV) (priority queue)"
}

def get_offline_answer(text: str):
    if not text:
        return None
    lower = text.lower()
    for key in OFFLINE_KB:
        if key in lower:
            return OFFLINE_KB[key]
    return None

# -----------------------------
# HELPER FUNCTIONS
# -----------------------------
def hash_password(password: str):
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str):
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()

    expire = datetime.utcnow() + (
        expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode.update({"exp": expire})

    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# -----------------------------
# SIGNUP API
# -----------------------------
@app.post("/signup")
def signup(user: SignupRequest):
    db = SessionLocal()

    existing_user = db.query(User).filter(User.email == user.email).first()
    if existing_user:
        db.close()
        raise HTTPException(status_code=400, detail="Email already registered!")

    new_user = User(
        name=user.name,
        email=user.email,
        hashed_password=hash_password(user.password)
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    db.close()

    token = create_access_token({"sub": new_user.email})

    return {
        "token": token,
        "user": {
            "name": new_user.name,
            "email": new_user.email
        }
    }

# -----------------------------
# LOGIN API
# -----------------------------
@app.post("/login")
def login(user: LoginRequest):
    db = SessionLocal()

    db_user = db.query(User).filter(User.email == user.email).first()
    if not db_user:
        db.close()
        raise HTTPException(status_code=400, detail="Invalid email or password!")

    if not verify_password(user.password, db_user.hashed_password):
        db.close()
        raise HTTPException(status_code=400, detail="Invalid email or password!")

    token = create_access_token({"sub": db_user.email})
    db.close()

    return {
        "token": token,
        "user": {
            "name": db_user.name,
            "email": db_user.email
        }
    }

# -----------------------------
# CHAT API (Gemini first, Offline fallback)
# -----------------------------
@app.post("/api/chat")
def chat(req: ChatRequest):
    if not req.messages:
        raise HTTPException(status_code=400, detail="No messages provided")

    last_message = req.messages[-1].get("content", "")

    # GEMINI FIRST
    if gemini_client is not None:
        prompt = ""
        for msg in req.messages:
            role = msg.get("role")
            content = msg.get("content")

            if role == "user":
                prompt += f"User: {content}\n"
            else:
                prompt += f"Assistant: {content}\n"

        prompt += "Assistant:"

        try:
            response = gemini_client.models.generate_content(
                model='gemini-2.5-flash',
                contents=prompt
            )
            return {"response": response.text}
        except Exception as e:
            # Fallback on Gemini error
            offline = get_offline_answer(last_message)
            if offline:
                return {"response": f"⚠️ Gemini API Error. Offline fallback:\n\n{offline}"}
            else:
                return {"response": f"⚠️ Gemini API Error: {str(e)}\n\n(No offline answer available for this query)"}
    else:
        # GEMINI UNAVAILABLE -> OFFLINE FALLBACK
        offline = get_offline_answer(last_message)
        if offline:
            return {"response": offline}
        else:
            return {"response": "⚠️ Gemini API key not configured. Offline mode only. Try asking about Chandrayaan-3, escape velocity, rocket equation, Voyager, or Dijkstra."}

# -----------------------------
# TEST ROUTE
# -----------------------------
@app.get("/")
def home():
    return {"message": "AeroGPT Auth + Chat API Running Successfully"}
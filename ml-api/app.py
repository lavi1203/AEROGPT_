# Updated dataset for 'derive' keyword to give Hard difficulty
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import re
import asyncio
from contextlib import asynccontextmanager

from sqlalchemy import Column, Integer, String, create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

from passlib.context import CryptContext
from jose import jwt
from datetime import datetime, timedelta

import os
from dotenv import load_dotenv
import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.pipeline import make_pipeline
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from google import genai

# CONFIG & AUTH SETUP
load_dotenv()
SECRET_KEY = os.getenv("SECRET_KEY", "fallback_dev_key")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./users.db")
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)

Base.metadata.create_all(bind=engine)

# GEMINI CONFIG
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    gemini_client = genai.Client(api_key=GEMINI_API_KEY)
    print("[SUCCESS] Gemini connected")
else:
    gemini_client = None
    print("[WARNING] GEMINI_API_KEY not found. Gemini disabled.")

# GLOBAL VARIABLES
best_model = None
best_model_name = None
best_accuracy = 0
embedder = None
faiss_index = None
QUESTIONS_LIST = []
models_ready = False

# -----------------------------
# BACKGROUND LOADER
# -----------------------------
def load_all_models():
    global best_model, best_model_name, best_accuracy
    global embedder, faiss_index, QUESTIONS_LIST, models_ready

    # Skip semantic search on low memory — saves ~400MB
    SKIP_SEMANTIC = os.getenv("SKIP_SEMANTIC", "true") == "true"

    print("\n[STARTUP] Loading models in background...\n")

    try:
        df = pd.read_csv("data1.csv", sep=",", on_bad_lines="skip", engine="python")
        df = df.dropna(subset=["question", "difficulty"])
        QUESTIONS_LIST = df["question"].astype(str).tolist()

        if not SKIP_SEMANTIC:
            print("[STARTUP] Building Semantic Search Index (FAISS)...")
            from sentence_transformers import SentenceTransformer
            import faiss
            embedder = SentenceTransformer("all-MiniLM-L6-v2")
            question_embeddings = embedder.encode(QUESTIONS_LIST, convert_to_numpy=True)
            dimension = question_embeddings.shape[1]
            faiss_index = faiss.IndexFlatL2(dimension)
            faiss_index.add(question_embeddings)
            print("[SUCCESS] Semantic Search Index Ready.")
        else:
            print("[STARTUP] Skipping Semantic Search Index (FAISS) to save memory. Will load on demand if needed.")

        X = df["question"]
        y = df["difficulty"]
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42, stratify=y
        )

        lr_model = make_pipeline(
            TfidfVectorizer(stop_words="english", max_features=5000, ngram_range=(1, 2)),
            LogisticRegression(max_iter=2000, class_weight="balanced")
        )
        lr_model.fit(X_train, y_train)
        lr_acc = accuracy_score(y_test, lr_model.predict(X_test)) * 100

        rf_model = make_pipeline(
            TfidfVectorizer(stop_words="english", max_features=5000, ngram_range=(1, 2)),
            RandomForestClassifier(n_estimators=300, random_state=42, max_features="sqrt", n_jobs=-1)
        )
        rf_model.fit(X_train, y_train)
        rf_acc = accuracy_score(y_test, rf_model.predict(X_test)) * 100

        if lr_acc >= rf_acc:
            best_model = lr_model
            best_model_name = "Logistic Regression"
            best_accuracy = lr_acc
        else:
            best_model = rf_model
            best_model_name = "Random Forest"
            best_accuracy = rf_acc

        print(f"[BEST MODEL]: {best_model_name} ({best_accuracy:.2f}%)")
        models_ready = True

    except Exception as e:
        print(f"[ERROR] Model loading failed: {e}")
        models_ready = False

# -----------------------------
# LIFESPAN — loads models after port opens
# -----------------------------
@asynccontextmanager
async def lifespan(app: FastAPI):
    loop = asyncio.get_event_loop()
    loop.run_in_executor(None, load_all_models)
    yield

# -----------------------------
# FASTAPI APP
# -----------------------------
app = FastAPI(title="AeroGPT Backend", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://aerogpt-three.vercel.app",  # Vercel (no trailing slash is usually required for CORS)
        "https://aerogpt-three.vercel.app/", # Just in case
        "http://localhost:3000",             # local React dev server
        "http://localhost:5173"              # Vite default port
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------------
# SCHEMAS
# -----------------------------
class ClassifyRequest(BaseModel):
    question: str

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
    "chandrayaan-3": "Chandrayaan-3 is ISRO's third lunar mission launched in 2023.\n\nComponents:\n1) Propulsion Module\n2) Vikram Lander\n3) Pragyan Rover\n\nIt successfully soft-landed on 23 August 2023 near the lunar south pole.",
    "escape velocity": "Escape velocity is the minimum speed required for an object to escape gravity.\n\nFormula:\nv = √(2GM/R)\n\nEarth escape velocity ≈ 11.2 km/s.",
    "tsiolkovsky": "Tsiolkovsky Rocket Equation:\n\nΔv = Ve ln(m0/mf)\n\nVe = exhaust velocity\nm0 = initial mass\nmf = final mass",
    "hamming distance": "Hamming distance is the number of positions where bits differ.\n\nExample:\n1011101\n1001001\nHamming distance = 2",
    "voyager": "Voyager 1 and Voyager 2 are NASA spacecraft launched in 1977.\n\nVoyager 1 entered interstellar space in 2012.",
    "dijkstra": "Dijkstra's Algorithm finds shortest paths in a weighted graph with non-negative weights.\n\nTime Complexity:\nO(V²) (array)\nO((V+E)logV) (priority queue)"
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
# AUTH HELPERS
# -----------------------------
def hash_password(password: str):
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str):
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def semantic_search(query: str, top_k: int = 3):
    global embedder, faiss_index
    if embedder is None or faiss_index is None:
        print("[ON-DEMAND] Loading Semantic Search Index...")
        try:
            from sentence_transformers import SentenceTransformer
            import faiss
            embedder = SentenceTransformer("all-MiniLM-L6-v2")
            question_embeddings = embedder.encode(QUESTIONS_LIST, convert_to_numpy=True)
            dimension = question_embeddings.shape[1]
            faiss_index = faiss.IndexFlatL2(dimension)
            faiss_index.add(question_embeddings)
            print("[SUCCESS] On-demand Semantic Search Index Ready.")
        except Exception as e:
            print(f"[ERROR] Failed to load semantic search: {e}")
            return []

    query_embedding = embedder.encode([query], convert_to_numpy=True)
    distances, indices = faiss_index.search(query_embedding, top_k)
    results = []
    for idx in indices[0]:
        if idx < len(QUESTIONS_LIST):
            results.append(QUESTIONS_LIST[idx])
    return results

# -----------------------------
# ROUTES
# -----------------------------
@app.get("/")
def home():
    return {"message": "AeroGPT Backend Running Successfully 🚀", "models_ready": models_ready}

@app.get("/health")
def health():
    return {"status": "ok", "models_ready": models_ready}

# -----------------------------
# CLASSIFIER API
# -----------------------------
@app.post("/api/classify")
async def classify_question(req: ClassifyRequest):
    if not models_ready or best_model is None:
        return {
            "difficulty": "Medium",
            "reason": "Models still loading, please try again in a moment",
            "model_used": "None",
            "accuracy": 0,
            "similar_questions": []
        }

    question = req.question.strip()
    if not question:
        return {
            "difficulty": "Easy",
            "reason": "Empty question",
            "model_used": best_model_name,
            "accuracy": best_accuracy,
            "similar_questions": []
        }

    try:
        prediction = best_model.predict([question])[0]
        proba = best_model.predict_proba([question])[0]
        
        if "pyq library" in question.lower() or "pyq" in question.lower():
            similar = semantic_search(question, top_k=3)
        else:
            similar = []

        return {
            "difficulty": str(prediction),
            "accuracy": best_accuracy,
            "model_used": best_model_name,
            "reason": f"Classified using TF-IDF + {best_model_name}",
            "similar_questions": similar
        }
    except Exception as e:
        return {"error": str(e)}

# -----------------------------
# AUTH APIs
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
    return {"token": token, "user": {"name": new_user.name, "email": new_user.email}}

@app.post("/login")
def login(user: LoginRequest):
    db = SessionLocal()
    db_user = db.query(User).filter(User.email == user.email).first()
    if not db_user or not verify_password(user.password, db_user.hashed_password):
        db.close()
        raise HTTPException(status_code=400, detail="Invalid email or password!")

    token = create_access_token({"sub": db_user.email})
    db.close()
    return {"token": token, "user": {"name": db_user.name, "email": db_user.email}}

# -----------------------------
# CHAT API
# -----------------------------
@app.post("/api/chat")
def chat(req: ChatRequest):
    if not req.messages:
        raise HTTPException(status_code=400, detail="No messages provided")

    last_message = req.messages[-1].get("content", "")

    if gemini_client:
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
                model="gemini-1.5-flash",
                contents=prompt
            )
            return {"response": response.text}
        except Exception as e:
            offline = get_offline_answer(last_message)
            if offline:
                return {"response": f"[WARNING] Gemini API Error. Offline fallback:\n\n{offline}"}
            else:
                return {"response": f"[WARNING] Gemini Error: {str(e)}"}
    else:
        offline = get_offline_answer(last_message)
        if offline:
            return {"response": offline}
        else:
            return {"response": "[WARNING] Gemini not configured. Offline mode only."}

import os
import httpx
from fastapi import FastAPI, Depends, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from jose import jwt, JWTError
from transformers import AutoTokenizer, FillMaskPipeline
from transformers import AutoModelForMaskedLM
import torch
from dotenv import load_dotenv

# Muat environment variables dari file .env untuk pengembangan lokal
load_dotenv()

# --- Konfigurasi Aplikasi ---
app = FastAPI()

# --- Konfigurasi CORS ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Izinkan semua untuk pengembangan. Nanti bisa dibatasi.
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Konfigurasi Supabase ---
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
SUPABASE_JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET")
SUPABASE_API_URL = f"{SUPABASE_URL}/rest/v1/messages"

# --- Pemuatan Model AI ---
# --- KEMBALI MENGGUNAKAN INDOBERT VERSI LITE ---
MODEL_NAME = "indobenchmark/indobert-lite-base-p1"
tokenizer = None
pipeline = None

@app.on_event("startup")
def load_model():
    """Muat model dan tokenizer saat server dimulai."""
    global tokenizer, pipeline
    try:
        print(f"Memuat model AI: {MODEL_NAME}...")
        # Memaksa penggunaan tokenizer standar (bukan yang 'fast') untuk menghindari error konversi
        tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME, use_fast=False)
        model = AutoModelForMaskedLM.from_pretrained(MODEL_NAME)
        pipeline = FillMaskPipeline(model=model, tokenizer=tokenizer, device=-1) # -1 berarti pakai CPU
        print("Model AI berhasil dimuat.")
    except Exception as e:
        print(f"Gagal memuat model: {e}")

# --- Model Data Pydantic ---
class ChatRequest(BaseModel):
    message: str

# --- Autentikasi ---
async def get_current_user(request: Request):
    """Dependensi untuk memvalidasi token JWT dari header."""
    token = request.headers.get("Authorization")
    if not token:
        raise HTTPException(status_code=401, detail="Header Authorization tidak ada")
    
    try:
        token = token.split(" ")[1]
        payload = jwt.decode(token, SUPABASE_JWT_SECRET, algorithms=["HS256"], audience='authenticated')
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Token tidak valid")
        return user_id
    except JWTError:
        raise HTTPException(status_code=401, detail="Token tidak valid atau kedaluwarsa")
    except IndexError:
        raise HTTPException(status_code=401, detail="Format token tidak valid")

# --- Endpoint API ---
@app.get("/")
def read_root():
    return {"status": "SAIAS Backend is running!"}

@app.post("/chat")
async def handle_chat(chat_request: ChatRequest, user_id: str = Depends(get_current_user)):
    """Menerima pesan, menghasilkan respons, dan menyimpannya ke database."""
    user_text = chat_request.message.lower().strip()
    ai_response = ""

    # 1. Periksa respons kustom
    if "siapa ahmad syaifuddin" in user_text:
        ai_response = "Ahmad Syaifuddin adalah developer keren yang sedang membangun chatbot AI canggih ini! Dia suka ngoding dan punya ide-ide kreatif."
    elif "tau ahmad syaifuddin" in user_text:
        ai_response = "Oh, Ahmad Syaifuddin? Dia mastermind di balik proyek ini, orang yang super antusias dengan AI dan teknologi web!"
    
    # 2. Jika tidak, gunakan model AI
    else:
        if pipeline is None:
            raise HTTPException(status_code=503, detail="Model AI tidak tersedia.")
        try:
            prompt = user_text + " " + tokenizer.mask_token
            result = pipeline(prompt)
            ai_response = result[0]['sequence'].replace(user_text, "").strip()
            if not ai_response or ai_response == ".":
                 ai_response = "Maaf, bisa ulangi pertanyaannya?"
        except Exception as e:
            print(f"Error saat inferensi model: {e}")
            raise HTTPException(status_code=500, detail="Gagal menghasilkan respons dari AI")

    # 3. Simpan percakapan ke Supabase
    headers = {"apikey": SUPABASE_KEY, "Authorization": f"Bearer {SUPABASE_KEY}"}
    payload = {
        "user_id": user_id,
        "user_text": chat_request.message,
        "ai_response": ai_response
    }
    async with httpx.AsyncClient() as client:
        try:
            db_response = await client.post(SUPABASE_API_URL, headers=headers, json=payload)
            db_response.raise_for_status()
        except httpx.HTTPStatusError as e:
            print(f"Error saat menyimpan ke Supabase: {e.response.text}")
            raise HTTPException(status_code=500, detail="Gagal menyimpan riwayat chat")

    return {"response": ai_response}

@app.get("/history")
async def get_history(user_id: str = Depends(get_current_user)):
    """Mengambil riwayat chat untuk pengguna yang terautentikasi."""
    headers = {"apikey": SUPABASE_KEY, "Authorization": f"Bearer {SUPABASE_KEY}"}
    params = {"user_id": f"eq.{user_id}", "order": "created_at.asc"}
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(SUPABASE_API_URL, headers=headers, params=params)
            response.raise_for_status()
            return response.json()
        except httpx.HTTPStatusError as e:
            print(f"Error saat mengambil riwayat dari Supabase: {e.response.text}")
            raise HTTPException(status_code=500, detail="Gagal mengambil riwayat chat")

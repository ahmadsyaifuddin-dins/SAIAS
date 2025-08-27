# ===============================================================
# LANGKAH 0: SET ENVIRONMENT VARIABLES DULU!
# ===============================================================
# 🚨 PENTING: Isi variabel ini dengan nilai dari Supabase dan Ngrok Anda!

# Ganti dengan nilai yang sebenarnya:
SUPABASE_URL = "https://xfbkekmarolrfpvuslgc.supabase.co"  # ← GANTI INI!
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmYmtla21hcm9scmZwdnVzbGdjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYyMDM5MTUsImV4cCI6MjA3MTc3OTkxNX0.yz5yE_DgN93Ql9qVvPKLtX3dBDfvBkzeQ_EmNSo50AY"            # ← GANTI INI!
SUPABASE_JWT_SECRET = "JRGKYQaUfl8I9yE5PAsQFp8g6+dawRw644csGFon8EMxSaVW7n4bu3dRxY96d+/is60bEagbPI/r2Qj0pgJPdA=="            # ← GANTI INI!
NGROK_AUTHTOKEN = "2rtE7N9yFwhNhESlZqU3JSrRtWF_jQWkppF5CfpCwbKVtBYr"           # ← GANTI INI!

print("🔧 Environment variables set!")
print(f"Supabase URL: {SUPABASE_URL}")
print(f"Ngrok token: {NGROK_AUTHTOKEN[:10]}...")

# ===============================================================
# LANGKAH 1: BERSIHKAN PORT DAN RESTART
# ===============================================================
import os
import subprocess
import time

def cleanup_ports():
    """Bersihkan port yang digunakan sebelumnya."""
    try:
        # Kill proses di port 8000 dan sekitarnya
        print("🧹 Membersihkan port...")
        subprocess.run(['fuser', '-k', '8000/tcp'], capture_output=True, text=True)
        subprocess.run(['pkill', '-f', 'ngrok'], capture_output=True)
        subprocess.run(['pkill', '-f', 'uvicorn'], capture_output=True)
        time.sleep(2)
        print("✅ Port cleanup selesai!")
    except Exception as e:
        print(f"Cleanup error (normal): {e}")

cleanup_ports()

# ===============================================================
# LANGKAH 2: INSTALASI LIBRARY
# ===============================================================
print("🚀 Memulai instalasi library...")
!pip install -q fastapi uvicorn pyngrok nest_asyncio transformers torch python-jose[cryptography] httpx

print("✅ Instalasi selesai.")

# ===============================================================
# LANGKAH 3: IMPORT DAN SETUP
# ===============================================================
import httpx
import traceback
import socket
import random
from contextlib import closing
from fastapi import FastAPI, Depends, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from jose import jwt, JWTError
import nest_asyncio
from pyngrok import ngrok
import uvicorn
import asyncio
from datetime import datetime

print("📚 Library imported successfully!")

# Set environment variables
os.environ['SUPABASE_URL'] = SUPABASE_URL
os.environ['SUPABASE_KEY'] = SUPABASE_KEY
os.environ['SUPABASE_JWT_SECRET'] = SUPABASE_JWT_SECRET

# ===============================================================
# LANGKAH 4: CARI PORT YANG KOSONG
# ===============================================================
def find_free_port(start_port=8000):
    """Cari port kosong mulai dari start_port."""
    for port in range(start_port, start_port + 10):
        try:
            with closing(socket.socket(socket.AF_INET, socket.SOCK_STREAM)) as sock:
                sock.bind(('', port))
                return port
        except OSError:
            continue
    return start_port + random.randint(10, 50)

PORT = find_free_port(8000)
print(f"🔍 Menggunakan port: {PORT}")

# ===============================================================
# LANGKAH 5: APLIKASI FASTAPI
# ===============================================================
print("🛠️ Membangun aplikasi FastAPI...")

app = FastAPI(
    title="SAIAS Backend", 
    version="1.0.0",
    description="AI Chat Backend by Ahmad Syaifuddin"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuration
SUPABASE_API_URL = f"{SUPABASE_URL}/rest/v1/messages"

# --- Data Models ---
class ChatRequest(BaseModel):
    message: str

# --- Authentication ---
async def get_current_user(request: Request):
    """Validate JWT token from Supabase."""
    token = request.headers.get("Authorization")
    if not token:
        raise HTTPException(status_code=401, detail="Authorization header missing")
    
    try:
        if "Bearer " in token:
            token = token.split(" ")[1]
        
        payload = jwt.decode(
            token, 
            SUPABASE_JWT_SECRET, 
            algorithms=["HS256"], 
            audience='authenticated'
        )
        
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")
            
        return user_id
        
    except JWTError as e:
        print(f"JWT Error: {e}")
        raise HTTPException(status_code=401, detail="Invalid or expired token")

# --- Simple Response Generator (No AI Model Needed) ---
def generate_smart_response(user_text: str) -> str:
    """Generate smart responses without heavy AI models."""
    
    text_lower = user_text.lower().strip()
    
    # Special responses about Ahmad Syaifuddin
    if any(keyword in text_lower for keyword in ["ahmad syaifuddin", "siapa ahmad", "tau ahmad", "kenal ahmad"]):
        return "Ahmad Syaifuddin adalah developer keren yang membuat SAIAS ini! Dia passionate dengan AI, web development, dan teknologi modern. Saat ini sedang fokus mengembangkan chatbot AI yang canggih! 🚀"
    
    # Greetings
    greetings = ["halo", "hai", "hello", "hi", "selamat", "apa kabar", "hei"]
    if any(greeting in text_lower for greeting in greetings):
        return "Halo! Saya SAIAS, AI assistant buatan Ahmad Syaifuddin. Senang bertemu dengan Anda! Ada yang bisa saya bantu hari ini? 😊"
    
    # Questions about SAIAS
    if any(keyword in text_lower for keyword in ["saias", "siapa kamu", "kamu siapa", "apa itu saias"]):
        return "Saya SAIAS (Smart AI Assistant), sebuah chatbot AI yang dikembangkan oleh Ahmad Syaifuddin. Saya diciptakan untuk membantu menjawab pertanyaan dan berinteraksi dengan pengguna secara natural dalam bahasa Indonesia!"
    
    # Tech questions
    if any(keyword in text_lower for keyword in ["teknologi", "coding", "programming", "web", "ai", "artificial intelligence"]):
        return "Ahmad Syaifuddin sangat tertarik dengan teknologi, terutama AI dan web development. SAIAS ini dibuat menggunakan FastAPI, Supabase, dan Svelte - stack teknologi modern yang powerful! Apa yang ingin Anda ketahui lebih lanjut?"
    
    # Thanks
    if any(keyword in text_lower for keyword in ["terima kasih", "makasih", "thanks", "thank you"]):
        return "Sama-sama! Senang bisa membantu. Ada lagi yang ingin ditanyakan? 😊"
    
    # Questions
    if "?" in user_text:
        responses = [
            "Pertanyaan menarik! Saya akan coba jawab sebaik mungkin. Bisa berikan konteks lebih detail?",
            "Hmm, untuk pertanyaan ini saya butuh informasi tambahan. Bisa dijelaskan lebih spesifik?",
            "Saya ingin membantu menjawab pertanyaan Anda. Bisa diperjelas atau diberi contoh?",
            "Pertanyaan bagus! Sayangnya saya butuh detail lebih untuk memberikan jawaban yang tepat."
        ]
    else:
        responses = [
            "Menarik! Bisa ceritakan lebih detail tentang hal tersebut?",
            "Saya mendengarkan. Ada yang spesifik yang ingin Anda tanyakan?",
            "Terima kasih sudah berbagi. Ada hal lain yang bisa saya bantu?",
            "Saya memahami. Apakah ada pertanyaan atau hal yang ingin didiskusikan lebih lanjut?",
            "Interesting! Bisa elaborasi lebih tentang topik ini?",
        ]
    
    return random.choice(responses)

# --- API Endpoints ---
@app.get("/")
def root():
    """Root endpoint."""
    return {
        "status": "✅ SAIAS Backend Running!",
        "port": PORT,
        "message": "Ready to chat!",
        "developer": "Ahmad Syaifuddin",
        "timestamp": datetime.now().isoformat()
    }

@app.get("/health")
def health():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "port": PORT,
        "backend": "FastAPI",
        "timestamp": datetime.now().isoformat(),
        "message": "SAIAS Backend is running smoothly!"
    }

@app.post("/chat")
async def chat(chat_request: ChatRequest, user_id: str = Depends(get_current_user)):
    """Main chat endpoint."""
    user_text = chat_request.message.strip()
    
    # Validation
    if not user_text:
        raise HTTPException(status_code=400, detail="Message cannot be empty")
    
    if len(user_text) > 1000:
        raise HTTPException(status_code=400, detail="Message too long (max 1000 characters)")
    
    # Generate response
    try:
        ai_response = generate_smart_response(user_text)
        print(f"💬 Chat: {user_text[:50]} -> {ai_response[:50]}")
    except Exception as e:
        print(f"Response generation error: {e}")
        ai_response = "Maaf, saya mengalami kesulitan memproses pesan Anda. Coba lagi ya!"
    
    # Save to Supabase asynchronously
    async def save_to_supabase():
        headers = {
            "apikey": SUPABASE_KEY,
            "Authorization": f"Bearer {SUPABASE_KEY}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "user_id": user_id,
            "user_text": user_text,
            "ai_response": ai_response
        }
        
        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                response = await client.post(SUPABASE_API_URL, headers=headers, json=payload)
                if response.status_code in [200, 201]:
                    print(f"💾 Saved successfully!")
                else:
                    print(f"⚠️ Supabase save error: {response.status_code}")
        except Exception as e:
            print(f"⚠️ Save to Supabase failed: {e}")
    
    # Run save in background
    asyncio.create_task(save_to_supabase())
    
    return {"response": ai_response}

@app.get("/history")
async def history(user_id: str = Depends(get_current_user)):
    """Get chat history for user."""
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json"
    }
    
    params = {
        "user_id": f"eq.{user_id}",
        "order": "created_at.asc",
        "limit": "100"
    }
    
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.get(SUPABASE_API_URL, headers=headers, params=params)
            
            if response.status_code == 200:
                data = response.json()
                print(f"📚 Loaded {len(data)} messages for user")
                return data
            else:
                print(f"Supabase history error: {response.status_code}")
                return []
                
    except Exception as e:
        print(f"History load error: {e}")
        return []

# ===============================================================
# LANGKAH 6: SETUP NGROK DAN JALANKAN SERVER
# ===============================================================
print(f"🌍 Setting up ngrok untuk port {PORT}...")

try:
    # Kill existing ngrok
    ngrok.kill()
    time.sleep(1)
    
    # Set authtoken
    ngrok.set_auth_token(NGROK_AUTHTOKEN)
    
    # Create tunnel
    public_url = ngrok.connect(PORT)
    clean_url = str(public_url).replace('NgrokTunnel: "', '').replace('" -> "http://localhost:' + str(PORT) + '"', '')
    
    print(f"✅ Backend tersedia di: {clean_url}")
    print(f"🔍 Test: {clean_url}/health")
    print(f"📝 Tambahkan ke .env.local frontend:")
    print(f"VITE_BACKEND_URL={clean_url}")
    
except Exception as e:
    print(f"🔥 Ngrok error: {e}")
    clean_url = f"http://localhost:{PORT}"

# Apply nest_asyncio untuk Colab
nest_asyncio.apply()

print(f"🚀 Starting server di port {PORT}...")
print("✨ SAIAS Backend siap digunakan!")
print("-" * 50)

# Jalankan server
try:
    uvicorn.run(
        app, 
        host="0.0.0.0", 
        port=PORT, 
        log_level="info"
    )
except KeyboardInterrupt:
    print("🛑 Server dihentikan oleh user")
except Exception as e:
    print(f"🔥 Server error: {e}")
    traceback.print_exc()
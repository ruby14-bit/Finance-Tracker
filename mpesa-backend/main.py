from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import httpx
import base64
from datetime import datetime

app = FastAPI()

# This lets your Next.js app talk to this Python engine
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- YOUR DARAJA KEYS ---
CONSUMER_KEY = "your_key"
CONSUMER_SECRET = "your_secret"
BUSINESS_SHORT_CODE = "174379" 
PASSKEY = "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919"

@app.post("/api/v1/mpesa/initiate-push")
async def initiate_push(phone: str, amount: int):
    # This logic handles the handshake with Safaricom
    # It sends the "PIN Prompt" to your phone
    return {"status": "Prompt Sent"}

@app.post("/api/v1/mpesa/callback")
async def mpesa_callback(request: Request):
    # This is where Safaricom sends the data AFTER you enter your PIN
    data = await request.json()
    print("M-Pesa Data Received:", data)
    return {"ResultCode": 0}
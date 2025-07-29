# main.py

from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os
import uvicorn
from llm_utils import query_gemini
from document_parser import parse_documents
import json

app = FastAPI(title="Dataposit AI Agent API")

# Add CORS middleware for production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, you should specify your domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files
app.mount("/static", StaticFiles(directory="."), name="static")

# Serve static files
@app.get("/")
async def read_index():
    return FileResponse("index.html")

@app.get("/styles.css")
async def read_styles():
    return FileResponse("styles.css")

@app.get("/script.js")
async def read_script():
    return FileResponse("script.js")

@app.get("/auth.js")
async def read_auth():
    return FileResponse("auth.js")

@app.get("/api.js")
async def read_api():
    return FileResponse("api.js")

@app.get("/api/firebase-config")
async def get_firebase_config():
    """Return Firebase configuration from environment variables"""
    config = {
        "apiKey": os.getenv("FIREBASE_API_KEY"),
        "authDomain": os.getenv("FIREBASE_AUTH_DOMAIN"),
        "projectId": os.getenv("FIREBASE_PROJECT_ID"),
        "storageBucket": os.getenv("FIREBASE_STORAGE_BUCKET"),
        "messagingSenderId": os.getenv("FIREBASE_MESSAGING_SENDER_ID"),
        "appId": os.getenv("FIREBASE_APP_ID")
    }
    
    # Check if all required config values are present
    missing_keys = [key for key, value in config.items() if not value]
    if missing_keys:
        raise HTTPException(
            status_code=500, 
            detail=f"Missing Firebase configuration: {', '.join(missing_keys)}"
        )
    
    return config

@app.post("/ask/")
async def ask_question(question: str = Form(...)):
    """Process a question and return an answer"""
    try:
        # Process documents in the Documents folder
        text_chunks, images = parse_documents("Documents")
        
        # Query Gemini with the question and processed documents
        answer = query_gemini(question, text_chunks, images)
        
        return {"answer": answer}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    # Use PORT environment variable for deployment
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)

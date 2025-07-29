# main.py

from fastapi import FastAPI, Form, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from document_parser import parse_documents
from llm_utils import query_gemini
from bc_query import query_business_central
from trusted_sources import suggest_resources
import os
from pydantic import BaseModel
import re
from dotenv import load_dotenv

# Load environment variables from .env.local
load_dotenv('.env.local')

app = FastAPI()

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve static files
app.mount("/static", StaticFiles(directory="."), name="static")

@app.get("/")
async def read_index():
    """Serve the main index.html file"""
    return FileResponse("index.html")

@app.get("/styles.css")
async def read_styles():
    """Serve the CSS file"""
    return FileResponse("styles.css")

@app.get("/script.js")
async def read_script():
    """Serve the main script file"""
    return FileResponse("script.js")

@app.get("/auth.js")
async def read_auth():
    """Serve the auth script file"""
    return FileResponse("auth.js")

@app.get("/api.js")
async def read_api():
    """Serve the API script file"""
    return FileResponse("api.js")

# === Request Schema ===
class AskRequest(BaseModel):
    question: str

@app.get("/api/firebase-config")
def get_firebase_config():
    """Securely serve Firebase configuration from environment variables."""
    return {
        "apiKey": os.getenv("FIREBASE_API_KEY"),
        "authDomain": os.getenv("FIREBASE_AUTH_DOMAIN"),
        "projectId": os.getenv("FIREBASE_PROJECT_ID"),
        "storageBucket": os.getenv("FIREBASE_STORAGE_BUCKET"),
        "messagingSenderId": os.getenv("FIREBASE_MESSAGING_SENDER_ID"),
        "appId": os.getenv("FIREBASE_APP_ID"),
        "measurementId": os.getenv("FIREBASE_MEASUREMENT_ID")
    }

@app.post("/ask/")
def ask_ai(request: AskRequest):
    question = request.question
    print("Received a request with question:", question)

    # 1. Parse/reference all files in Documents folder
    docs_text, images = parse_documents("Documents")

    # 1a. Try to answer from the document (improved search)
    if docs_text:
        all_text = " ".join(docs_text)
        print(f"Searching for '{question}' in {len(all_text)} characters of document text")
        
        # Analyze the question to determine what to search for
        question_lower = question.lower()
        
        # Extract key terms from the question with better context matching
        key_terms = []
        
        # If question is about specific people or roles, search for those
        if any(term in question_lower for term in ["responsible", "linda", "tonny", "functional", "developer"]):
            key_terms = ["functional responsible", "linda", "developer responsible", "tonny", "delivery note header", "ava"]
        # If question is about Microsoft BC, search for BC-related content
        elif any(term in question_lower for term in ["microsoft", "bc", "business central", "what is"]):
            # For Business Central definition questions, don't search documents
            if any(term in question_lower for term in ["what is", "definition", "define"]):
                print("Question is about Business Central definition - skipping document search")
                key_terms = []  # Don't search documents for BC definition questions
            else:
                key_terms = ["business central", "microsoft", "bc", "cronus", "company", "system"]
        # If question is about delivery notes, search for delivery content
        elif any(term in question_lower for term in ["delivery", "note", "header"]):
            key_terms = ["delivery note", "header", "ava", "functional responsible", "linda"]
        # Default: search for general terms in the question
        else:
            # Extract meaningful words from the question
            words = question_lower.split()
            key_terms = [word for word in words if len(word) > 3 and word not in ["what", "is", "the", "and", "for", "with", "this", "that"]]
        
        print(f"Searching for key terms: {key_terms}")
        
        # Improved search: Check each document chunk individually for relevance
        best_chunk = None
        best_score = 0
        best_context = ""
        
        for i, doc_chunk in enumerate(docs_text):
            chunk_lower = doc_chunk.lower()
            chunk_score = 0
            found_terms = []
            
            # Check if this chunk contains any key terms
            for term in key_terms:
                if term.lower() in chunk_lower:
                    chunk_score += 1
                    found_terms.append(term)
            
            # Additional relevance checks
            if chunk_score > 0:
                # Check for context relevance
                context_relevant = True
                
                # If question is about Microsoft BC, avoid Cronus-specific content
                if any(term in question_lower for term in ["microsoft", "bc", "business central", "what is"]):
                    if "cronus" in chunk_lower and "business central" not in chunk_lower:
                        context_relevant = False
                        print(f"Chunk {i+1} contains Cronus content but question is about BC - skipping")
                
                # If question is about specific people, make sure the chunk contains relevant context
                if any(term in question_lower for term in ["responsible", "linda", "tonny", "functional"]):
                    if not any(term in chunk_lower for term in ["responsible", "linda", "tonny", "functional", "developer"]):
                        context_relevant = False
                        print(f"Chunk {i+1} doesn't contain relevant person/role context - skipping")
                
                # If question is about delivery notes, make sure the chunk contains delivery context
                if any(term in question_lower for term in ["delivery", "note", "header"]):
                    if not any(term in chunk_lower for term in ["delivery", "note", "header", "ava"]):
                        context_relevant = False
                        print(f"Chunk {i+1} doesn't contain delivery context - skipping")
                
                if context_relevant and chunk_score > best_score:
                    best_score = chunk_score
                    best_chunk = doc_chunk
                    best_context = f"Found {len(found_terms)} relevant terms: {found_terms}"
                    print(f"New best chunk {i+1} with score {chunk_score}: {found_terms}")
        
        # Only return document answer if we found a relevant chunk
        if best_chunk and best_score >= 1:
            print(f"Returning document answer: {best_context}")
            return {"source": "Document", "answer": best_chunk.strip()}
        
        print(f"Document search didn't find relevant information, falling back to Business Central")
    else:
        print("No documents found or no text extracted")

    # 2. Fallback: Business Central
    print("Trying Business Central...")
    bc_answer = query_business_central(question)
    if bc_answer and "Unable to fetch content" not in bc_answer and "visit the link" not in bc_answer:
        return {"source": "Business Central", "answer": bc_answer}

    # 3. Fallback: Trusted Resources
    print("Trying Trusted Sources...")
    resources = suggest_resources(question)
    if resources and "https://" not in resources:  # Only use if it's not just a link
        return {"source": "Trusted Sources", "answer": resources}

    # 4. Fallback: Gemini (with Business Central context for BC questions)
    print("Trying Gemini...")
    if any(term in question.lower() for term in ["microsoft", "bc", "business central"]):
        # Use Gemini with Business Central context
        gemini_prompt = f"""
        Answer this question about Microsoft Business Central: "{question}"
        
        Provide a comprehensive answer about Business Central, including:
        - What Business Central is
        - Its key features and capabilities
        - How it helps businesses
        - Common use cases
        
        Make it informative and helpful for someone asking about Business Central.
        """
        gemini_response = query_gemini(gemini_prompt, "", [])
    else:
        gemini_response = query_gemini(question, "", [])
    
    if gemini_response and len(gemini_response.strip()) > 10 and "I don't know" not in gemini_response:
        return {"source": "Gemini", "answer": gemini_response}

    # 5. Final fallback
    print("No relevant information found from any source")
    return {
        "source": "None",
        "answer": "I couldn't find a direct answer. Please do more research or consult a certified expert."
    }

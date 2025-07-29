import google.generativeai as genai
from PIL import Image
import io
import os
from dotenv import load_dotenv

# Load environment variables from .env.local
load_dotenv('.env.local')

# Use Gemini API key from environment variables
api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    raise ValueError("GEMINI_API_KEY environment variable is not set. Please add it to your .env.local file.")

genai.configure(api_key=api_key)

def query_gemini(query, text_chunks, images):
    # ✅ FIXED: Use the correct model names
    model_name = "models/gemini-1.5-pro-latest" if images else "models/gemini-1.5-pro-latest"
    model = genai.GenerativeModel(model_name)

    input_parts = []

    # Add text chunks if available
    if text_chunks:
        input_parts.append({"text": "\n".join(text_chunks)})

    # Add images as byte buffers
    for image in images:
        buf = io.BytesIO()
        image.save(buf, format='PNG')
        buf.seek(0)
        input_parts.append({"image": buf.read()})

    # Add the query
    input_parts.append({"text": query})

    try:
        response = model.generate_content(input_parts)
        return response.text
    except Exception as e:
        return f"Gemini Error: {str(e)}"



import requests
import json

# Test the API
url = "http://127.0.0.1:8000/ask/"
data = {"question": "What is the definition of Business Central"}

try:
    response = requests.post(url, json=data)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
    
    if response.status_code == 200:
        result = response.json()
        print(f"\nSource: {result.get('source', 'N/A')}")
        print(f"Answer: {result.get('answer', 'N/A')}")
        
        # Check the source and content
        source = result.get('source', 'N/A')
        answer = result.get('answer', 'N/A')
        
        if source == 'Document':
            print("\n✅ Found relevant document content!")
        elif source == 'Business Central':
            print("\n✅ Found Business Central content!")
        elif source == 'Gemini':
            print("\n✅ Found Gemini response!")
        else:
            print(f"\n📋 Source: {source}")
    else:
        print(f"Error: {response.status_code}")
        
except Exception as e:
    print(f"Error: {e}") 
    
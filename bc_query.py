import requests
from bs4 import BeautifulSoup
from trusted_sources import get_microsoft_learn_link
from llm_utils import query_gemini
import pandas as pd

def query_business_central(query: str) -> str:
    """
    Uses Microsoft Learn as a fallback to guide the user.
    Fetches and returns actual content from Microsoft Learn pages.
    """
    print(f"Querying Business Central for: {query}")
    
    # Define specific Business Central documentation URLs (similar to Google Sheets approach)
    bc_docs = {
        "inventory": {
            "url": "https://learn.microsoft.com/en-us/dynamics365/business-central/inventory-how-manage",
            "title": "Inventory Management in Business Central",
            "keywords": ["inventory", "items", "stock", "register", "manage"]
        },
        "setup": {
            "url": "https://learn.microsoft.com/en-us/dynamics365/business-central/setup",
            "title": "Business Central Setup",
            "keywords": ["setup", "configuration", "installation", "initialization"]
        },
        "finance": {
            "url": "https://learn.microsoft.com/en-us/dynamics365/business-central/finance",
            "title": "Financial Management in Business Central",
            "keywords": ["finance", "accounting", "ledger", "journal", "chart of accounts"]
        },
        "sales": {
            "url": "https://learn.microsoft.com/en-us/dynamics365/business-central/sales-manage-sales",
            "title": "Sales Management in Business Central",
            "keywords": ["sales", "orders", "invoices", "customers", "quotes"]
        },
        "purchasing": {
            "url": "https://learn.microsoft.com/en-us/dynamics365/business-central/purchasing-manage-purchasing",
            "title": "Purchasing Management in Business Central",
            "keywords": ["purchasing", "vendors", "purchase orders", "receiving"]
        },
        "warehouse": {
            "url": "https://learn.microsoft.com/en-us/dynamics365/business-central/warehouse-manage-warehouse",
            "title": "Warehouse Management in Business Central",
            "keywords": ["warehouse", "location", "bin", "picking", "put-away"]
        },
        "development": {
            "url": "https://learn.microsoft.com/en-us/dynamics365/business-central/dev-itpro/",
            "title": "Business Central Development",
            "keywords": ["development", "AL", "extensions", "API", "code"]
        },
        "overview": {
            "url": "https://learn.microsoft.com/en-us/dynamics365/business-central/",
            "title": "Business Central Overview",
            "keywords": ["overview", "introduction", "what is", "definition", "define"]
        }
    }
    
    # Match query to best documentation section
    query_lower = query.lower()
    best_match = None
    best_score = 0
    
    for section, data in bc_docs.items():
        score = 0
        for keyword in data["keywords"]:
            if keyword in query_lower:
                score += 1
        if score > best_score:
            best_score = score
            best_match = section
    
    # If no good match found, try Gemini for keyword extraction
    if best_score == 0:
        try:
            gemini_prompt = f"""
            Extract the most relevant Business Central topic for this query: "{query}"
            
            Choose from: inventory, setup, finance, sales, purchasing, warehouse, development
            Return only the single most relevant topic.
            """
            keywords_response = query_gemini(gemini_prompt, "", [])
            if keywords_response:
                suggested_topic = keywords_response.strip().lower()
                if suggested_topic in bc_docs:
                    best_match = suggested_topic
                    print(f"Gemini suggested topic: {suggested_topic}")
        except Exception as e:
            print(f"Gemini keyword extraction failed: {e}")
    
    # Fetch content from the best matching section
    if best_match and best_match in bc_docs:
        print(f"Using {best_match} documentation")
        doc_data = bc_docs[best_match]
        content = fetch_microsoft_learn_content(doc_data["url"])
        if content and len(content) > 100:
            return content
    
    # Fallback to general BC overview
    print("Using general BC overview")
    general_url = "https://learn.microsoft.com/en-us/dynamics365/business-central/"
    return fetch_microsoft_learn_content(general_url)

def fetch_microsoft_learn_content(learn_link: str) -> str:
    """
    Fetch and parse content from Microsoft Learn pages with improved extraction.
    """
    try:
        # Fetch the webpage content
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        response = requests.get(learn_link, timeout=15, headers=headers)
        response.raise_for_status()
        
        # Parse the HTML content
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Extract the main content (title and description)
        title = soup.find('title')
        title_text = title.get_text().strip() if title else "Microsoft Learn Resource"
        
        # Try multiple selectors to find the main content
        content_selectors = [
            'main',
            'article', 
            'div[class*="content"]',
            'div[class*="main"]',
            'div[class*="article"]',
            'div[role="main"]',
            '.content',
            '.main-content',
            '.article-content',
            '#content',
            '#main'
        ]
        
        main_content = None
        for selector in content_selectors:
            main_content = soup.select_one(selector)
            if main_content:
                print(f"Found content using selector: {selector}")
                break
        
        if main_content:
            # Extract paragraphs, headings, and lists
            content_elements = main_content.find_all(['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'li'])
            content_text = []
            
            for element in content_elements[:15]:  # Limit to first 15 elements
                text = element.get_text().strip()
                if text and len(text) > 50:  # Only include substantial text
                    # Clean up the text
                    text = ' '.join(text.split())  # Remove extra whitespace
                    # Skip repetitive content
                    if text not in content_text and not text.startswith('©') and not text.startswith('Privacy'):
                        content_text.append(text)
            
            if content_text:
                # Combine title and content
                result = f"Title: {title_text}\n\n"
                result += "\n\n".join(content_text[:5])  # Limit to first 5 paragraphs
                result += f"\n\nSource: {learn_link}"
                return result
        
        # If main content not found, try to extract from body
        body = soup.find('body')
        if body:
            # Remove script and style elements
            for script in body(["script", "style", "nav", "header", "footer"]):
                script.decompose()
            
            # Get text content
            text_content = body.get_text()
            # Clean up the text
            lines = [line.strip() for line in text_content.split('\n') if line.strip()]
            content_lines = []
            
            for line in lines:
                if len(line) > 80 and not line.startswith('©') and not line.startswith('Privacy') and not line.startswith('Skip to'):
                    # Remove repetitive content
                    if line not in content_lines:
                        content_lines.append(line)
            
            if content_lines:
                result = f"Title: {title_text}\n\n"
                result += "\n\n".join(content_lines[:4])
                result += f"\n\nSource: {learn_link}"
                return result
        
        # Fallback: return title and link if content extraction fails
        return f"Title: {title_text}\n\nFor detailed information, visit: {learn_link}"
        
    except Exception as e:
        print(f"Error fetching content from {learn_link}: {e}")
        # If fetching fails, return the link with a message
        return f"Microsoft Learn Resource: {learn_link}\n\nUnable to fetch content directly. Please visit the link for detailed information."

from document_parser import parse_documents
import re

# Test document parsing
print("Testing document parsing...")
docs_text, images = parse_documents("Documents")

print(f"\nExtracted {len(docs_text)} text chunks:")
for i, chunk in enumerate(docs_text):
    print(f"\n--- Chunk {i+1} ---")
    print(chunk[:500] + "..." if len(chunk) > 500 else chunk)

# Test search with improved logic
question = "Functional Responsible for Delivery Note Header- AVA"
print(f"\n\nSearching for: '{question}'")

if docs_text:
    all_text = " ".join(docs_text)
    print(f"Total text length: {len(all_text)} characters")
    
    # More flexible search - look for key terms instead of exact phrase
    key_terms = ["functional responsible", "linda", "delivery note header", "ava"]
    found_terms = []
    
    for term in key_terms:
        if term.lower() in all_text.lower():
            found_terms.append(term)
            print(f"Found term: '{term}'")
    
    if len(found_terms) >= 2:  # If we find at least 2 key terms, we likely have an answer
        print(f"Found {len(found_terms)} key terms, constructing answer...")
        
        # Find the relevant section containing the answer
        for i, doc_chunk in enumerate(docs_text):
            chunk_lower = doc_chunk.lower()
            # Check if this chunk contains multiple key terms
            chunk_terms = [term for term in key_terms if term.lower() in chunk_lower]
            if len(chunk_terms) >= 2:
                print(f"Found relevant chunk {i+1} with terms: {chunk_terms}")
                print(f"ANSWER: {doc_chunk.strip()}")
                break
        
        # If not found in individual chunks, return a snippet from the full text
        # Find the sentence or paragraph containing the most key terms
        sentences = re.split(r'[.!?]+', all_text)
        best_sentence = None
        best_score = 0
        
        for sentence in sentences:
            sentence_lower = sentence.lower()
            score = sum(1 for term in key_terms if term.lower() in sentence_lower)
            if score > best_score:
                best_score = score
                best_sentence = sentence
        
        if best_sentence and best_score >= 2:
            print(f"Found best sentence with {best_score} key terms")
            print(f"ANSWER: {best_sentence.strip()}")
        
        # Fallback: return a portion of the text around the first match
        for term in key_terms:
            match_index = all_text.lower().find(term.lower())
            if match_index != -1:
                start = max(0, match_index - 200)
                end = min(len(all_text), match_index + len(term) + 400)
                snippet = all_text[start:end].strip()
                print(f"Found match for '{term}' at position {match_index}, returning snippet")
                print(f"ANSWER: {snippet}")
                break
    else:
        print(f"Only found {len(found_terms)} key terms, not enough for a reliable answer")
else:
    print("No documents found or no text extracted") 
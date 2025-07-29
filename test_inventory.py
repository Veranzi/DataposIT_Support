from bc_query import get_microsoft_learn_link, fetch_microsoft_learn_content

# Test inventory link
print("Testing inventory link...")
inventory_link = get_microsoft_learn_link("inventory")
print(f"Inventory link: {inventory_link}")

# Test content extraction
print("\nTesting content extraction...")
content = fetch_microsoft_learn_content(inventory_link)
print(f"Content length: {len(content)}")
print(f"Content preview: {content[:500]}...")

# Check if content contains inventory-specific terms
inventory_terms = ["inventory", "items", "stock", "register", "manage"]
found_terms = [term for term in inventory_terms if term.lower() in content.lower()]
print(f"\nFound inventory terms: {found_terms}") 
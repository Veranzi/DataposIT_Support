#!/usr/bin/env python3
"""
Create .env.local file with Firebase configuration
"""

import os
import shutil

def create_env_file():
    """Create .env.local file from template."""
    template_file = "env.local.template"
    env_file = ".env.local"
    
    if os.path.exists(env_file):
        print(f"⚠️  {env_file} already exists!")
        response = input("Do you want to overwrite it? (y/N): ")
        if response.lower() != 'y':
            print("Operation cancelled.")
            return
    
    if os.path.exists(template_file):
        try:
            shutil.copy(template_file, env_file)
            print(f"✅ {env_file} created successfully!")
            print("\n📝 Next steps:")
            print("1. Edit .env.local with your actual API keys")
            print("2. Make sure your Firebase project is set up correctly")
            print("3. Start the server: python -m uvicorn main:app --reload")
        except Exception as e:
            print(f"❌ Failed to create {env_file}: {e}")
    else:
        print(f"❌ Template file {template_file} not found!")

if __name__ == "__main__":
    print("🚀 Creating .env.local file...")
    create_env_file() 
#!/usr/bin/env python3
"""
DataposIT Support AI System - Setup Script
This script helps you set up the environment and install dependencies.
"""

import os
import sys
import subprocess
import shutil
from pathlib import Path

def print_banner():
    """Print the setup banner."""
    print("=" * 60)
    print("🚀 DataposIT Support AI System - Setup")
    print("=" * 60)
    print()

def check_python_version():
    """Check if Python version is compatible."""
    if sys.version_info < (3, 8):
        print("❌ Python 3.8 or higher is required!")
        print(f"Current version: {sys.version}")
        sys.exit(1)
    print(f"✅ Python {sys.version_info.major}.{sys.version_info.minor} detected")

def install_python_dependencies():
    """Install Python dependencies."""
    print("📦 Installing Python dependencies...")
    try:
        subprocess.run([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"], 
                      check=True, capture_output=True, text=True)
        print("✅ Python dependencies installed successfully!")
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to install Python dependencies: {e}")
        return False
    return True

def install_node_dependencies():
    """Install Node.js dependencies if package.json exists."""
    if os.path.exists("package.json"):
        print("📦 Installing Node.js dependencies...")
        try:
            subprocess.run(["npm", "install"], check=True, capture_output=True, text=True)
            print("✅ Node.js dependencies installed successfully!")
        except subprocess.CalledProcessError as e:
            print(f"❌ Failed to install Node.js dependencies: {e}")
            print("⚠️  You may need to install Node.js first")
            return False
    else:
        print("ℹ️  No package.json found, skipping Node.js dependencies")
    return True

def create_env_file():
    """Create .env.local file from template."""
    template_file = "env.local.template"
    env_file = ".env.local"
    
    if os.path.exists(env_file):
        print(f"ℹ️  {env_file} already exists, skipping creation")
        return True
    
    if os.path.exists(template_file):
        print(f"📝 Creating {env_file} from template...")
        try:
            shutil.copy(template_file, env_file)
            print(f"✅ {env_file} created successfully!")
            print("⚠️  Please edit .env.local with your actual API keys and configuration")
        except Exception as e:
            print(f"❌ Failed to create {env_file}: {e}")
            return False
    else:
        print(f"⚠️  Template file {template_file} not found")
        return False
    return True

def create_documents_folder():
    """Create Documents folder if it doesn't exist."""
    docs_folder = Path("Documents")
    if not docs_folder.exists():
        print("📁 Creating Documents folder...")
        docs_folder.mkdir()
        print("✅ Documents folder created!")
        print("📄 Please add your PDF, DOCX, and TXT files to the Documents/ folder")
    else:
        print("ℹ️  Documents folder already exists")

def check_requirements():
    """Check if all required files exist."""
    required_files = [
        "main.py",
        "requirements.txt",
        "index.html",
        "script.js",
        "styles.css"
    ]
    
    print("🔍 Checking required files...")
    missing_files = []
    for file in required_files:
        if os.path.exists(file):
            print(f"✅ {file}")
        else:
            print(f"❌ {file} (missing)")
            missing_files.append(file)
    
    if missing_files:
        print(f"\n⚠️  Missing files: {', '.join(missing_files)}")
        return False
    return True

def print_next_steps():
    """Print next steps for the user."""
    print("\n" + "=" * 60)
    print("🎉 Setup completed successfully!")
    print("=" * 60)
    print("\n📋 Next steps:")
    print("1. Edit .env.local with your API keys:")
    print("   - GEMINI_API_KEY: Get from https://makersuite.google.com/app/apikey")
    print("   - FIREBASE_*: Get from your Firebase project console")
    print("\n2. Add documents to the Documents/ folder")
    print("   - Supported formats: PDF, DOCX, TXT")
    print("\n3. Start the backend server:")
    print("   python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000")
    print("\n4. Open index.html in your browser")
    print("\n5. Start asking questions!")
    print("\n📚 For more information, see README.md")

def main():
    """Main setup function."""
    print_banner()
    
    # Check Python version
    check_python_version()
    print()
    
    # Check required files
    if not check_requirements():
        print("\n❌ Setup failed: Missing required files")
        sys.exit(1)
    print()
    
    # Install dependencies
    if not install_python_dependencies():
        print("\n❌ Setup failed: Could not install Python dependencies")
        sys.exit(1)
    print()
    
    if not install_node_dependencies():
        print("\n⚠️  Node.js dependencies installation failed, but continuing...")
    print()
    
    # Create environment file
    create_env_file()
    print()
    
    # Create documents folder
    create_documents_folder()
    print()
    
    # Print next steps
    print_next_steps()

if __name__ == "__main__":
    main() 
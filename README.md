# DataposIT Support AI System

An intelligent AI-powered support system that combines local document search with Business Central integration and Gemini AI to provide comprehensive answers to user queries.

## 🚀 Features

### Core Functionality
- **Smart Document Search**: Intelligent search through local PDF, DOCX, and TXT files with context-aware matching
- **Business Central Integration**: Web scraping from Microsoft Learn for BC-related queries
- **AI-Powered Responses**: Integration with Google Gemini for comprehensive answers
- **Fallback System**: Sequential checking of information sources (Documents → Business Central → Trusted Sources → Gemini → None)
- **Modern UI**: Clean, responsive interface with Firebase authentication

### Key Capabilities
- **Multi-format Document Support**: Parse PDF, DOCX, and TXT files
- **Context-Aware Search**: Avoids returning irrelevant content from multiple documents
- **Real-time Web Scraping**: Fetches live content from Microsoft Learn
- **Conversation History**: Firebase-powered chat history and user management
- **Source Attribution**: Clear display of information sources in chat messages

## 🛠️ Technology Stack

### Backend
- **FastAPI**: Modern Python web framework
- **BeautifulSoup4**: Web scraping for Business Central content
- **Google Gemini**: AI-powered responses
- **Python-docx**: DOCX file parsing
- **PyPDF2**: PDF file parsing

### Frontend
- **HTML5/CSS3**: Modern, responsive UI
- **JavaScript**: Interactive chat functionality
- **Firebase**: Authentication and conversation management

### Infrastructure
- **Uvicorn**: ASGI server for FastAPI
- **CORS**: Cross-origin resource sharing
- **Pydantic**: Data validation

## 📦 Installation

### Prerequisites
- Python 3.8+
- Node.js (for Firebase)
- Git

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/Veranzi/DataposIT_Support.git
   cd DataposIT_Support
   ```

2. **Install Python dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Install Node.js dependencies**
   ```bash
   npm install
   ```

4. **Set up environment variables**
   Create a `.env` file with:
   ```
   GEMINI_API_KEY=your_gemini_api_key_here
   FIREBASE_API_KEY=your_firebase_api_key_here
   FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   FIREBASE_PROJECT_ID=your_project_id
   FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   FIREBASE_APP_ID=your_app_id
   ```

5. **Add documents to the Documents folder**
   Place your PDF, DOCX, and TXT files in the `Documents/` directory.

## 🚀 Running the Application

### Start the Backend Server
```bash
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Open the Frontend
Open `index.html` in your web browser or serve it using a local server.

## 📁 Project Structure

```
DataposIT_Support/
├── main.py                 # FastAPI backend with fallback logic
├── bc_query.py            # Business Central integration
├── document_parser.py     # Multi-format document parsing
├── llm_utils.py          # Gemini AI integration
├── trusted_sources.py    # Microsoft Learn resource mapping
├── index.html            # Main UI
├── script.js             # Frontend functionality
├── styles.css            # UI styling
├── auth.js              # Firebase authentication
├── requirements.txt      # Python dependencies
├── package.json         # Node.js dependencies
├── Documents/           # Local documents folder
└── README.md           # This file
```

## 🔄 How It Works

### 1. Document Search
- Parses all files in the `Documents/` folder
- Uses intelligent keyword matching with context awareness
- Avoids returning irrelevant content from multiple PDFs

### 2. Business Central Integration
- Web scrapes Microsoft Learn for BC-related queries
- Provides structured content with proper formatting
- Falls back to general BC overview when specific content isn't found

### 3. AI Integration
- Uses Google Gemini for comprehensive answers
- Provides context-aware responses for Business Central questions
- Handles general queries when other sources don't have answers

### 4. Fallback System
The system follows this priority order:
1. **Local Documents** → Search through uploaded files
2. **Business Central** → Microsoft Learn web scraping
3. **Trusted Sources** → Predefined resource links
4. **Gemini AI** → AI-powered responses
5. **None** → Default response when no information is found

## 🎯 Usage Examples

### Document Queries
```
"Who is the functional responsible for delivery note header AVA"
"Request to Sync and Mandatory Reason Code Field"
```

### Business Central Queries
```
"What is the definition of Business Central"
"How to get inventory in Business Central"
"Business Central setup and configuration"
```

### General Queries
```
"Tell me about Microsoft Dynamics"
"What are the features of Business Central"
```

## 🔧 Configuration

### Customizing Document Search
Edit `main.py` to modify search logic and keyword matching.

### Adding Business Central Resources
Update `trusted_sources.py` to add more Microsoft Learn links.

### Modifying UI
Edit `styles.css` and `script.js` for UI customization.

## 🚀 Deployment

### Local Development
```bash
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Production Deployment
1. Set up a production server (AWS, Azure, etc.)
2. Install dependencies
3. Configure environment variables
4. Use a production ASGI server like Gunicorn

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Contact the development team
- Check the documentation

## 🔄 Updates

### Recent Improvements
- ✅ Improved document search with context-aware matching
- ✅ Enhanced Business Central web scraping
- ✅ Better UI with source attribution
- ✅ Firebase integration for user management
- ✅ Multi-format document support

### Planned Features
- 🔄 Real-time document updates
- 🔄 Advanced search filters
- 🔄 Export conversation history
- 🔄 Multi-language support

---

**Built with ❤️ for DataposIT Support Team** 
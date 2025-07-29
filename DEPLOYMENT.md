# Deployment Guide for Render

## Prerequisites

1. **GitHub Repository**: Make sure your code is pushed to a GitHub repository
2. **Render Account**: Sign up at [render.com](https://render.com)
3. **Environment Variables**: You'll need to set up your environment variables in Render

## Step 1: Prepare Your Repository

Your repository should now contain:
- `main.py` - FastAPI application
- `requirements.txt` - Python dependencies
- `render.yaml` - Render configuration
- `llm_utils.py` - Gemini AI integration
- `document_parser.py` - Document processing (PDF, DOCX, TXT)
- `index.html`, `styles.css`, `script.js`, `auth.js` - Frontend files
- `.env.local.template` - Environment variables template

## Step 2: Deploy to Render

### Option A: Using render.yaml (Recommended)

1. **Push your code to GitHub**:
   ```bash
   git add .
   git commit -m "Add deployment configuration"
   git push origin main
   ```

2. **Connect to Render**:
   - Go to [render.com](https://render.com)
   - Sign in with your GitHub account
   - Click "New +" and select "Blueprint"
   - Connect your GitHub repository
   - Render will automatically detect the `render.yaml` file

3. **Set Environment Variables**:
   - In your Render dashboard, go to your service
   - Navigate to "Environment" tab
   - Add the following environment variables:
     ```
     GEMINI_API_KEY=your_gemini_api_key
     FIREBASE_API_KEY=your_firebase_api_key
     FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
     FIREBASE_PROJECT_ID=your_project_id
     FIREBASE_STORAGE_BUCKET=your_project.appspot.com
     FIREBASE_MESSAGING_SENDER_ID=your_sender_id
     FIREBASE_APP_ID=your_app_id
     ```

### Option B: Manual Deployment

1. **Create New Web Service**:
   - Go to Render dashboard
   - Click "New +" → "Web Service"
   - Connect your GitHub repository

2. **Configure the Service**:
   - **Name**: `dataposit-ai-agent`
   - **Environment**: `Python`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`

3. **Set Environment Variables** (same as above)

## Step 3: Update Frontend URLs

After deployment, you'll need to update the frontend to use your Render URL instead of localhost:

1. **Update API calls in script.js**:
   ```javascript
   // Change from:
   const response = await fetch("http://127.0.0.1:8000/ask/", {
   
   // To:
   const response = await fetch("https://your-app-name.onrender.com/ask/", {
   ```

2. **Update Firebase configuration** (if needed):
   - Make sure your Firebase project allows your Render domain
   - Add your Render domain to Firebase Auth authorized domains

## Step 4: Test Your Deployment

1. **Check the logs** in Render dashboard for any errors
2. **Test the application** by visiting your Render URL
3. **Test authentication** and message sending
4. **Check Firebase integration** works correctly

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `GEMINI_API_KEY` | Your Google Gemini API key | `AIzaSyC...` |
| `FIREBASE_API_KEY` | Firebase project API key | `AIzaSyC...` |
| `FIREBASE_AUTH_DOMAIN` | Firebase auth domain | `your-project.firebaseapp.com` |
| `FIREBASE_PROJECT_ID` | Firebase project ID | `your-project-id` |
| `FIREBASE_STORAGE_BUCKET` | Firebase storage bucket | `your-project.appspot.com` |
| `FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID | `123456789` |
| `FIREBASE_APP_ID` | Firebase app ID | `1:123456789:web:abc123` |

## Dependencies

The application uses the following key dependencies:
- `fastapi` - Web framework
- `uvicorn` - ASGI server
- `google-generativeai` - Gemini AI integration
- `python-docx` - DOCX file parsing
- `pytesseract` - OCR for PDF images
- `pdf2image` - PDF to image conversion
- `Pillow` - Image processing

## Troubleshooting

### Common Issues:

1. **Build fails**: Check that all dependencies are in `requirements.txt`
2. **Environment variables missing**: Verify all variables are set in Render dashboard
3. **CORS errors**: The app is configured to allow all origins for development
4. **Firebase errors**: Check that your Firebase project allows your Render domain
5. **Document parsing errors**: Ensure all document parsing dependencies are installed

### Logs:
- Check Render dashboard → Your service → Logs
- Look for any error messages during build or runtime

## Security Notes

1. **Environment Variables**: Never commit sensitive keys to your repository
2. **CORS**: In production, consider restricting CORS origins to your domain
3. **Firebase**: Ensure your Firebase project has proper security rules
4. **API Keys**: Rotate your API keys regularly

## Custom Domain (Optional)

1. **Add custom domain** in Render dashboard
2. **Update DNS** to point to your Render service
3. **Update Firebase** authorized domains with your custom domain
4. **Update frontend URLs** to use your custom domain

Your application should now be live at: `https://your-app-name.onrender.com` 
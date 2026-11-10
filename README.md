# Mahesh's Portfolio Website

A professional portfolio website with an integrated backend contact form system.

## 📋 Project Overview

This is a fully functional portfolio website showcasing web development services. The website features:

- **Frontend**: Responsive portfolio site built with HTML, CSS, and vanilla JavaScript
- **Backend**: Express.js server handling contact form submissions
- **Features**: Smooth animations, typing effects, responsive design, email notifications

## ✨ Features

### Frontend
✅ Responsive design (mobile, tablet, desktop)
✅ Smooth scrolling navigation
✅ Typing animation effects
✅ Sticky navigation bar
✅ Scroll-to-top button
✅ Modern UI with gradient colors
✅ Section-based layout (Home, About, Services, Skills, Contact)

### Backend
✅ Contact form API endpoint
✅ Input validation and sanitization
✅ Email notifications (Gmail or SMTP)
✅ File-based message storage (fallback)
✅ CORS support
✅ Error handling
✅ Request logging

## 🛠 Technologies Used

### Frontend
- HTML5
- CSS3 (with media queries for responsiveness)
- JavaScript (ES6+)
- jQuery (for animations)
- Typed.js (for typing effects)
- Font Awesome (for icons)
- Owl Carousel (for carousel functionality)

### Backend
- Node.js
- Express.js
- Nodemailer (for email)
- dotenv (for environment configuration)

## 📁 Project Structure

```
portfolio-improved/
├── frontend/
│   ├── index.html          # Main HTML file
│   ├── style.css           # All styles (cleaned)
│   ├── script.js           # Frontend logic (cleaned)
│   └── image/              # Images directory
│
├── backend/
│   ├── server.js           # Express server entry point
│   ├── routes/
│   │   └── contact.js      # Contact form routes
│   ├── controllers/
│   │   └── contactController.js  # Form handling logic
│   └── middleware/
│       └── validation.js   # Input validation
│
├── google-apps-script/
│   └── Code.gs             # Google Sheets Web App endpoint
├── messages/               # Stored contact messages (auto-created)
├── .env.example            # Environment variables template
├── .gitignore              # Git ignore rules
├── package.json            # Dependencies
└── README.md              # This file
```

## 🚀 Installation

### Prerequisites
- Node.js v14 or higher
- npm or yarn
- (Optional) Gmail account or SMTP server for email notifications

### Step 1: Clone/Download
```bash
# Download and extract the project
cd portfolio-improved
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Configure Environment
```bash
# Copy environment template
cp .env.example .env

# Edit .env with your configuration
# See "Environment Setup" section below
```

### Step 4: Start the Server
```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

The server will run on `http://localhost:5000`

### Step 5: Access the Website
Open your browser and visit `http://localhost:5000`

## ⚙️ Environment Setup

### Option 1: Gmail (Recommended for Quick Setup)

1. **Create an App Password:**
   - Go to https://myaccount.google.com/apppasswords
   - Select "Mail" and "Windows Computer"
   - Copy the generated password

2. **Configure .env:**
   ```env
   PORT=5000
   NODE_ENV=development
   CORS_ORIGIN=http://localhost:3000
   
   EMAIL_SERVICE=gmail
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-app-password
   EMAIL_FROM_ADDRESS=noreply@yourname.com
   EMAIL_RECIPIENT=your-email@gmail.com
   ```

### Option 2: SMTP (Custom Email Server)

```env
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000

SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@example.com
SMTP_PASSWORD=your-password
EMAIL_FROM_ADDRESS=noreply@example.com
EMAIL_RECIPIENT=recipient@example.com
```

### Option 3: File Storage (Development Only)

No email configuration needed. Messages will be automatically saved to the `/messages` directory.

```env
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

### Google Sheets Contact Storage (Optional)

The backend can append contact submissions to a Google Sheet through a Google Apps Script Web App. The endpoint URL and shared secret stay on the backend and are not exposed to the browser.

1. Create a Google Sheet and copy its spreadsheet ID from its URL.
2. Open [script.google.com](https://script.google.com), create a project, and paste in `google-apps-script/Code.gs`.
3. In **Project Settings → Script Properties**, add:
   - `SPREADSHEET_ID` — the spreadsheet ID
   - `SHEETS_SHARED_SECRET` — a long, random secret
   - `SHEET_NAME` — optional; defaults to `Contact Messages`
4. Deploy the script as a **Web app**, set it to **Execute as me**, and allow access to **Anyone**. The shared secret protects the write endpoint.
5. Add the deployment URL and the exact same secret to the project's `.env`:
   ```env
   GOOGLE_SHEETS_WEB_APP_URL=https://script.google.com/macros/s/your-deployment-id/exec
   GOOGLE_SHEETS_SHARED_SECRET=your-long-random-secret
   ```
6. Restart the backend. New valid submissions will be added to the sheet. If Sheets is enabled but unavailable or misconfigured, the API reports a failure; the existing file backup is still retained.

## 📡 API Documentation

### Contact Form Endpoint

**Endpoint:** `POST /api/contact`

**Description:** Submit a contact form message

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "subject": "Project Inquiry",
  "message": "I would like to discuss a web development project..."
}
```

**Field Validation:**
- **name**: 2-100 characters (required)
- **email**: Valid email format (required)
- **subject**: 5-200 characters (required)
- **message**: 10-5000 characters (required)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Your message has been received. I will get back to you soon!"
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    "Name must be at least 2 characters"
  ]
}
```

**Error Response (500):**
```json
{
  "success": false,
  "message": "Failed to send message. Please try again later."
}
```

### Health Check Endpoint

**Endpoint:** `GET /api/health`

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## 🔒 Security Features

✅ **Input Validation:** All form fields are validated on the server
✅ **Input Sanitization:** HTML special characters are escaped
✅ **CORS Protection:** Configured CORS headers
✅ **Error Handling:** Sensitive information is not exposed in error messages
✅ **Environment Variables:** Secrets stored in .env file
✅ **File Size Limits:** Request payload limited to 10KB
✅ **No Exposed Passwords:** Email credentials stored in .env

## 🧪 Testing the Contact Form

### Using Browser
1. Navigate to `http://localhost:5000`
2. Scroll to "Contact me" section
3. Fill in the form:
   - **Name:** Your Name
   - **Email:** your@email.com
   - **Subject:** Test Message
   - **Message:** This is a test message
4. Click "Send message"
5. You should see a success message

### Using cURL
```bash
curl -X POST http://localhost:5000/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "subject": "Test",
    "message": "Testing the contact form"
  }'
```

### Using Postman
1. Create a new POST request
2. URL: `http://localhost:5000/api/contact`
3. Set header: `Content-Type: application/json`
4. Set body (raw JSON):
   ```json
   {
     "name": "John Doe",
     "email": "john@example.com",
     "subject": "Test",
     "message": "Testing the contact form with Postman"
   }
   ```
5. Send request

## 📂 Message Storage

### Email Notifications
- If configured, messages are sent via email and saved to `/messages` directory as backup

### File Storage
- Messages are saved as JSON files with timestamp
- Location: `/messages/message-YYYY-MM-DD-HH-MM-SS.json`
- Format:
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "subject": "Test",
    "message": "Testing...",
    "receivedAt": "2024-01-15T10:30:00.000Z",
    "ipAddress": "192.168.1.1"
  }
  ```

## 🐛 Troubleshooting

### Issue: "Cannot find module 'express'"
**Solution:**
```bash
npm install
```

### Issue: Port 5000 already in use
**Solution:** Change port in `.env`:
```env
PORT=5001
```

### Issue: Email not sending
**Troubleshooting:**
1. Check `.env` configuration is correct
2. For Gmail: Verify app password is correct (not regular password)
3. For SMTP: Test credentials with another email client
4. Messages should still be saved to `/messages` directory
5. Check server console for error messages

### Issue: CORS errors in browser console
**Solution:** Update `.env` with correct frontend URL:
```env
CORS_ORIGIN=http://localhost:3000
```

### Issue: Validation errors when submitting form
**Check:**
- Name must be 2-100 characters
- Email must be valid format
- Subject must be 5-200 characters
- Message must be 10-5000 characters

## 🔄 Backend Architecture

### Server
- Express.js server with CORS and body parser middleware
- Serves static frontend files
- Handles API requests

### Routes
- `/api/contact` - POST endpoint for contact form
- `/api/health` - Health check endpoint
- `*` - Serves frontend for all other routes (SPA support)

### Controllers
- `contactController.js` - Handles form submission logic
- Manages email sending
- Falls back to file storage

### Middleware
- `validation.js` - Validates input fields
- CORS middleware - Handles cross-origin requests
- Request logging - Logs all requests

## 📝 Code Changes Summary

### Files Removed/Cleaned
- ✅ Removed unused HTML meta tags (anime-related keywords, old tracking)
- ✅ Removed unused JavaScript carousel code
- ✅ Removed unused CSS classes and selectors
- ✅ Removed obsolete team/carousel section
- ✅ Removed dependency on Formspree
- ✅ Removed unnecessary external links

### Files Created
- ✅ `backend/server.js` - Express server
- ✅ `backend/routes/contact.js` - Contact routes
- ✅ `backend/controllers/contactController.js` - Form handling
- ✅ `backend/middleware/validation.js` - Input validation
- ✅ `package.json` - Dependencies
- ✅ `.env.example` - Environment template
- ✅ `.gitignore` - Git ignore rules
- ✅ `README.md` - This documentation

### Files Modified
- ✅ `frontend/index.html` - Cleaned HTML, added form ID, improved structure
- ✅ `frontend/script.js` - Added backend integration, removed carousel code
- ✅ `frontend/style.css` - Optimized and cleaned unused styles
- ✅ Added form message display styles

## 🚀 Deployment

### Deploy to Render

1. Push the project to GitHub.
2. In Render, choose **New → Blueprint** and connect the repository. Render will use [`render.yaml`](./render.yaml) to create the web service.
3. Set `EMAIL_SERVICE` to `gmail`, and provide `EMAIL_USER` and `EMAIL_PASSWORD` when prompted. Use a Gmail app password for `EMAIL_PASSWORD`; do not commit credentials.
4. Deploy. The Express service serves both the website and `/api/contact`, and Render checks `/api/health`.

For a custom SMTP provider, configure `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, and `SMTP_PASSWORD` in the Render dashboard instead of the Gmail variables. Set `EMAIL_FROM_ADDRESS` and `EMAIL_RECIPIENT` there if needed. These values belong in Render's environment settings, not in Git.

### Deploy to Railway

1. Connect GitHub repository to Railway
2. Set environment variables
3. Deploy automatically

### Deploy to Heroku

1. Install Heroku CLI
2. Run:
   ```bash
   heroku login
   heroku create your-app-name
   git push heroku main
   heroku config:set PORT=5000 EMAIL_SERVICE=gmail ...
   ```

## 💡 Future Improvements

1. Add database (MongoDB/PostgreSQL) for persistent message storage
2. Implement message dashboard for viewing submissions
3. Add rate limiting to prevent spam
4. Add CAPTCHA verification
5. Implement message read/unread status
6. Add file upload support
7. Create admin panel for managing messages
8. Add automatic email replies to users

## 📄 License

MIT License - Feel free to use this project for personal or commercial purposes.

## 👤 Author

**Mahesh** - Web Developer & Designer

- Email: mehramahesh135@gmail.com
- Instagram: [@mmehrax](https://www.instagram.com/mmehrax)
- WhatsApp: [Contact](https://wa.me/message/V5YJEQGJBTH2D1)

## 🤝 Support

For issues or questions:
1. Check the Troubleshooting section above
2. Review API documentation
3. Check server console logs
4. Verify `.env` configuration

---

**Version:** 1.0.0  
**Last Updated:** 2024  
**Status:** Production Ready

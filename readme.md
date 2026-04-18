# MAIL_HACK 🚀  
AI-Powered Smart Mail Web App (Voice + NLP Enabled)

---

## 📌 Overview

**MAIL_HACK** is a full-stack demo web application that simulates a modern email system enhanced with **AI-powered reply generation**, **voice interaction**, and **intelligent meeting scheduling**.

Instead of integrating with real email providers, the system runs locally and uses **browser storage + AI APIs** to demonstrate how email workflows can be transformed into an intelligent assistant experience.

---

## 🎯 Objective

Traditional email systems are:
- Time-consuming (manual replies)
- Inefficient (manual meeting scheduling)
- Not voice-friendly

MAIL_HACK solves this by:
- Automating replies using AI  
- Enabling voice-based interactions  
- Extracting structured meeting data from natural language  

---

## 🧠 Key Features

### 📥 Mail System
- Inbox & Sent mail simulation  
- Compose and send emails  
- Local storage-based persistence  

### 🤖 AI Integration
- Smart reply generation using OpenAI  
- Context-aware email responses  
- Natural language processing for meetings  

### 🎤 Voice Features
- Speech-to-text (voice input for replies)  
- Text-to-speech (read emails aloud)  
- Hands-free interaction  

### 📅 Meeting Scheduler
- Create meetings via voice or text  
- AI extracts:
  - Date  
  - Time  
  - Context  
- Auto-generates confirmation emails  

### 🌙 UI/UX
- Clean Gmail/Outlook-inspired layout  
- Fully responsive dark-mode interface  

---

## 🏗️ Architecture
Frontend (HTML/CSS/JS)
│
▼
API Calls (fetch)
│
▼
Backend (Node.js + Express)
│
▼
OpenAI API (NLP Processing)
│
▼
Response → Frontend UI


---

## 📂 Project Structure


mail_hack/
│
├── frontend/
│ ├── index.html # Main mail interface (Inbox, Sent)
│ ├── meetings.html # Meeting management page
│ ├── style.css # Global dark-mode styling
│ ├── script.js # Mail logic (UI + API calls)
│ ├── meetings.js # Meeting logic
│ └── assets/ # Icons/images (optional)
│
├── backend/
│ ├── server.js # Express server entry point
│ ├── routes/
│ │ ├── generateReply.js # AI email reply endpoint
│ │ └── scheduleMeeting.js # AI meeting extraction endpoint
│ └── config/
│ └── openai.js # OpenAI API configuration
│
├── package.json # Backend dependencies
├── .env # Environment variables (API key)
└── README.md # Documentation


---

## ⚙️ Installation & Setup

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd mail_hack
2. Install Backend Dependencies
npm install
3. Setup Environment Variables

Create a .env file:

OPENAI_API_KEY=your_api_key_here
4. Run Backend Server
npm start

Server will run at:

http://localhost:3000
5. Run Frontend

Open:

frontend/index.html
🔁 Application Workflows
✉️ Email Reply Flow
User opens an email
Clicks voice input
Speaks reply
Speech → Text
Request sent to backend (/generate-reply)
OpenAI generates polished response
Response added to Sent folder
📅 Meeting Creation Flow
User navigates to Meetings page
Clicks "Create Meeting"
Provides voice/text input
Backend (/schedule-meeting) processes input
AI extracts structured meeting details
Meeting stored locally
Confirmation email generated and added to Sent
🧩 Core Components
Frontend
UI rendering and interaction
Inbox, Sent, Meetings state management
Uses localStorage for persistence
Integrates browser voice APIs
Backend
Express server with REST APIs
Handles AI requests
Secures API keys and prompts
AI Layer
Email reply transformation
Meeting detail extraction
Prompt-based NLP workflows
🗄️ Data Handling

All data is stored locally using:

localStorage
Stored Data
Sent emails (mailHackSentMessages)
Meetings data
Confirmation messages
🔊 Voice Integration
Speech Recognition
Converts spoken input → text
Used for replies and meeting creation
Speech Synthesis
Converts text → audio
Used for reading emails aloud
🧪 Challenges Faced
Voice recognition inconsistencies
Async frontend-backend communication
Incorrect AI workflow triggering
Debugging API responses
UI state synchronization
🏆 Accomplishments
Built full-stack working demo system
Integrated AI into real workflows
Implemented voice-driven interaction
Created clean modern UI
Designed end-to-end automation pipeline
⚠️ Limitations
No real Gmail/Outlook integration
No database (uses localStorage)
Voice accuracy depends on browser
Single-user demo only
No authentication system
🔮 Future Improvements
Gmail/Outlook API integration
Calendar sync (Google Calendar, Outlook)
Database integration (MongoDB/Firebase)
Multi-user authentication
AI intent classification
Mobile application
🧠 Tech Stack
Frontend
HTML
CSS (Dark Mode UI)
JavaScript
Backend
Node.js
Express
AI
OpenAI API
Browser APIs
SpeechRecognition
SpeechSynthesis
💡 Key Learnings
Full-stack system design
AI integration into workflows
Voice-based interaction systems
Async API handling and debugging
UX design for productivity tools
📢 Final Note

MAIL_HACK demonstrates how traditional email systems can evolve into AI-assisted productivity platforms by combining:

Natural Language Processing
Voice Interaction
Smart Automation
Full-Stack Development
👨‍💻 Author

Vignesh Balaji

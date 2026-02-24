# EduPrime - Premium AI Online Class Platform

## Overview
EduPrime is a modern online class platform featuring real-time video conferencing, AI-based attentiveness monitoring, and comprehensive student/teacher dashboards.

## Tech Stack
- **Frontend**: React (Vite) + Tailwind CSS
- **Backend**: Node.js + Express + MongoDB
- **AI Service**: Python + MediaPipe + Flask

## Setup

1. **Prerequisites**: Node.js, Python, MongoDB.
2. **Install Dependencies**:
   - The system should have already installed dependencies. If not:
   ```bash
   cd server && npm install
   cd client && npm install
   cd ai_service && python -m venv venv && venv\Scripts\activate && pip install -r requirements.txt
   ```
3. **Environment**:
   - Check `server/.env` for MongoDB URI (default: localhost).

## Running the App
Double-click `start_app.bat` to launch all services.

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **AI Service**: http://localhost:5001

## Features Implemented
- **Authentication**: Login/Signup with JWT.
- **Role Management**: Student & Teacher dashboards.
- **Classroom**: Jitsi Meet integration for video.
- **AI Monitoring**: Skeleton for Face/Gaze tracking (Python service).

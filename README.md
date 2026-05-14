# HSAD Alert Portal

A robust, admin-managed notification system and alert portal. Built as a Progressive Web App (PWA) and mobile application, it enables administrators to push critical announcements while providing users with a seamless, responsive interface.

## 🚀 Features

- **Admin Dashboard**: Secure management interface for creating, editing, and deleting announcements.
- **Cross-Platform Compatibility**: Built with Expo (React Native), supporting seamless deployment to both Web (PWA) and Mobile.
- **Push Notifications**: Integrated alert delivery system.
- **Flask Backend API**: Lightweight and secure Python backend using Flask and SQLite (via SQLAlchemy) for persistent data storage.
- **User Personalization**: Includes local history management and a user-controlled dark mode theme.
- **Role-Based Access**: Specialized views and capabilities based on user roles (Admin vs. Standard User).

## 🛠️ Technology Stack

- **Frontend**: React Native, Expo, Expo Router
- **Backend**: Python, Flask, SQLAlchemy, SQLite
- **Deployment**: Vercel (Frontend PWA), PythonAnywhere (Backend API)

## 📦 Getting Started

### Prerequisites
- Node.js & npm/yarn
- Python 3.x
- Expo CLI

### Local Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/bilawalHussain5646/hsad-alert-portal.git
   cd hsad-alert-portal
   ```

2. **Install Frontend Dependencies:**
   ```bash
   npm install
   ```

3. **Start the Frontend (Expo):**
   ```bash
   npx expo start
   ```

4. **Setup Backend:**
   ```bash
   cd backend
   python -m venv env
   source env/bin/activate  # On Windows: env\Scripts\activate
   pip install -r requirements.txt
   python app.py
   ```

## 📝 License

This project is proprietary and confidential.

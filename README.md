# crackIT Platform

crackIT is an AI-powered platform designed for evaluating code, mentoring junior developers, and onboarding new employees. The project features a modern web frontend and a robust backend that integrates with Gemini AI to provide intelligent feedback on code submissions.

## Project Structure

The platform is divided into two main components:

- **Frontend (`crackIT-front/`)**: Built with React, Vite, and Tailwind CSS. It provides a user-friendly interface for managing tasks, simulating AI chats, viewing analytics, and interacting with the system.
- **Backend (`crackIT-back/`)**: Built with Node.js and Express. It handles API requests, task management, code diff analysis, and communication with the Gemini AI services.

## Features

- **AI Mentor (Beyim)**: An AI-driven virtual team lead that helps with onboarding, answers questions about company culture, processes, and tasks.
- **Task Evaluation**: Evaluates code submissions by comparing the user's diff against a solution diff based on specific criteria.
- **Interactive Chat**: A built-in chat interface to interact with the AI mentor.
- **Analytics Dashboard**: Visualizes user progress and task completion statistics.
- **Swagger API Documentation**: Automatically generated API documentation accessible via `/api-docs`.

## Tech Stack

### Frontend
- React 18
- Vite
- Tailwind CSS
- Supabase (for authentication and database)
- React Router DOM
- Lucide React (for icons)

### Backend
- Node.js
- Express
- TypeScript
- @google/generative-ai (for Gemini integration)
- diff (for code comparison)
- Swagger UI Express

## Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn
- Supabase account (for database setup)
- Google Gemini API key

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd crackIT-back
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the `crackIT-back` directory and add your environment variables:
   ```env
   PORT=5000
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```
   The backend will run on `http://localhost:5000` and Swagger docs at `http://localhost:5000/api-docs`.

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd crackIT-front
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the `crackIT-front` directory and add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_url_here
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```
   The frontend will run on the port provided by Vite (usually `http://localhost:5173`).

## Database Schema

The platform uses Supabase for data storage. The main tables include:
- `users`: Stores user profiles (role, full name, email, avatar).
- `tasks`: Stores task definitions (title, description, template code, solution code, evaluation criteria).
- `submissions`: Stores user code submissions and their evaluation scores.

*Note: You can initialize the database using the provided `database.sql` script in the backend directory.*

## License

This project is licensed under the ISC License.